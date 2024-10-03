import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer/index.js'
import StateToken from './models/StateToken.js'
import UserToken from './models/UserToken.js'

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
 * @returns {String} Returns token value
 */
export const authenticateUser = ({ user: { mail, password }, sender, transporter }) => {
    const userToken = new UserToken({ user: { email: mail, password: password } })
    userToken.generateToken()

    const mailOptions = {
        from: sender,
        to: mail,
        subject: 'Authentication',
        text: `Your token is: ${userToken.token}`
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err)
            return
        }
        const timeOut = setTimeout(() => {
            state.removeToken(userToken, (response) => {})
        }, 10000)
        state.addToken({ userToken, timeOutID: timeOut })
    })
    return userToken.token
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