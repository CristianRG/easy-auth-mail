import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer/index.js'
import StateToken from './models/StateToken.js'
import UserToken from './models/UserToken.js'
import fs from 'node:fs'
import MailOptions from './models/MailOptions.js'

const state = new StateToken()

/**
 * Create a new transport to authenticate the sender
 * @param {string} service - Service of mail
 * @param {Object} auth - Authentication from sender. Use an object for example {user: 'youremail@gmail.com', pass: 'yourpassword'}
 * @returns {Mail} transporter 
 */
export const createTransport = ({ service, auth }) => {
    const transporter = nodemailer.createTransport({
        service: service,
        auth
    })
    return transporter
}

/**
 * Authenticate a user by sending an email with their token.
 * 
 * @param {Object} param - The object containing the user's information and email details.
 * @param {Object} param.user - The user object.
 * @param {string} param.user.mail - The user's email address where the authentication email will be sent.
 * @param {string} param.user.password - The user's password to generate the token
 * @param {string} param.sender - The email address of the sender.
 * @param {Mail} param.transporter - The Nodemailer transporter object used to send the email.
 * @param {Object} param.content
 * @param {String} param.content.subject
 * @param {String} param.content.type
 * @param {String} param.content.path
 * @returns {Promise} Returns a promise with token value
 */
export const authenticateUser = async ({ user: { mail, password }, sender, transporter, content: { subject, type, path } }) => {
    const userToken = new UserToken({ user: { email: mail, password: password } })
    userToken.generateToken()

    const mailOptions = new MailOptions(sender, mail, subject)
    let content = `Your token is ${userToken.token}`

    if (path) {
        const response = await customHTML({
            path: path, matches: [
                { match: { id: 'token', value: userToken.token } }, { match: { id: 'user', value: userToken.email } }
            ]
        })
        if (response.type == 'success') content = response.data.html
    }
    mailOptions.setContent(type, content)

    const response = await transporter.sendMail(mailOptions.getObject())

    return new Promise((resolve, reject) => {
        if (response.accepted.length > 0) {
            const timeOut = setTimeout(() => {
                state.removeToken(userToken, (response) => { })
            }, 10000)
            state.addToken({ userToken, timeOutID: timeOut })
            resolve(userToken.token)
        } else {
            reject('not send mail')
        }
    })
}

/**
 * 
 * @param {Object} param - Receive a object with the value of token
 * @param {String} param.token - Value of token
 * @returns {Boolean}
 */
export const authenticateToken = ({ token }) => {
    const userToken = state.getToken(token)
    if (userToken != null) {
        state.removeToken(userToken, (response) => {
            clearTimeout(response.timeOutID)
        })
        return true
    }
    return false
}

/**
 * Set a custom HTML to send and set dinamyc values
 * @param {Object} param
 * @param {String} param.path
 * @param {String} param.token
 * @param {Array} param.matches - Set an array of objects like {match: {id: 'token', value: 'Token'}} to insert inner target html the value by id provided
 * @returns {Promise} - Promise with an object result. If is error indicates error. Otherwise return html data
 */
export const customHTML = async ({ path, matches }) => {
    const contentHTML = new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) reject({ type: 'error', message: err });
            resolve(data)
        })
    })

    const date = new Date()
    const dateInit = date.getMilliseconds()
    const html = await contentHTML
    const rows = html.split('\r\n')

    const matchesList = Promise.all(matches.map((match) => {
        return new Promise((resolve, reject) => {
            for (let index = 0; index < rows.length; index++) {
                const row = rows[index]
                const coincidenceIndex = row.indexOf(`id="${match.match.id}"`)
                if (coincidenceIndex != -1) {
                    const startTarget = row.substring(row.indexOf('<'), row.indexOf('>') + 1)
                    const endTarget = row.substring(row.indexOf('</'), row.lastIndexOf('>') + 1)
                    const target = startTarget + match.match.value + endTarget
                    resolve({ type: 'success', message: 'matched successfully', data: { row: target, index: index, ...match } })
                }
            }
            reject({ type: 'error', message: 'Error to match', data: { ...match } })
        })
    }))

    return new Promise((resolve, reject) => {
        matchesList.then((listResolved) => {
            Promise.all(listResolved.map(element => {
                return new Promise((resolve, reject) => {
                    const { type, data } = element
                    if (type == 'success') {
                        const { row, index } = data
                        rows[index] = row
                        resolve({ type: 'success', message: 'Seted successfully' })
                    }
                    reject({ type: 'error', message: 'Something was wrong...' })
                })
            }))
                .then(solved => {
                    const date = new Date()
                    const dateEnd = date.getMilliseconds()
                    resolve({ type: 'success', message: 'Seted all successfully', data: { html: rows.join('\n'), time: `${(dateEnd - dateInit)} miliseconds` } })
                })
                .catch(err => reject({ type: 'error', message: err }))
        })
            .catch(err => reject({ type: 'error', message: err }))
    })
}