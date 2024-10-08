import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer/index.js'
import StateToken from './models/StateToken.js'
import fs from 'node:fs'
import MailOptions, { types } from './models/MailOptions.js'

const state = new StateToken()

/**
 * Crea un nuevo transportador para autenticar al remitente.
 * @param {Object} param - Objecto con los parametros de servicio y autentificación del remitente
 * @param {string} param.service - Servicio de correo (por ejemplo, 'gmail').
 * @param {{user: string, pass: string}} param.auth - Objeto de autenticación del remitente, debe contener el correo y la contraseña { user: 'tuemail@gmail.com', pass: 'tupassword' }.
 * @returns {Mail} transporter - Un objeto `transporter` para enviar correos.
 */
export const createTransport = ({ service, auth }) => {
    const transporter = nodemailer.createTransport({
        service: service,
        auth
    })
    return transporter
}

/**
 * Crea las opciones de correo con el remitente, destinatario y contenido.
 * 
 * @param {Object} param - Parámetros para crear las opciones de correo.
 * @param {{mail: string}} param.sender - Correo del remitente.
 * @param {{mail: string, token: string}} param.user - Correo y token del usuario.
 * @param {{subject: string, document: {path: string, matches: [{match: { id: string, value: string }}]}}} param.content - Contenido del correo, incluyendo el asunto y documento HTML para personalización.
 * @returns {MailOptions} - Objeto con las opciones configuradas para el correo.
 */
export const createMailOptions = async ({ sender, user, content }) => {
    const mailOptions = new MailOptions(sender.mail, user.mail, content.subject)

    if (content.document) {
        const document = await customHTML({ path: content.document.path, matches: content.document.matches })
        if (document.type == 'success') {
            mailOptions.setContent(types['text/html'], document.data.html)
        } else {
            mailOptions.setContent(types['text/plain'], `Your token is ${user.token}`)
        }
        return mailOptions
    }

    mailOptions.setContent(types['text/plain'], `Your token is ${user.token}`)
    return mailOptions
}

/**
 * Autentica a un usuario enviando un correo con su token.
 * 
 * @param {Object} param - Objeto con la información del usuario y detalles del correo.
 * @param {Object} param.userToken - Objeto de usuario que contiene el correo, token y contraseña
 * @param {Mail} param.transport - Objeto transportador de Nodemailer para enviar el correo.
 * @param {MailOptions} param.mailOptions - Opciones de correo configuradas para el envío.
 * @param {Object} param.config - Objeto con configuraciones
 * @param {number} param.config.timeOutDuration - Duración en milisegundos del token para expirar
 * @returns {Promise<string>} - Retorna una promesa con el valor del token.
 */
export const authenticateUser = async ({ userToken, transport, mailOptions, config: { timeOutDuration } }) => {
    const response = await transport.sendMail(mailOptions.getObject())

    return new Promise((resolve, reject) => {
        if (response.accepted.length > 0) {
            const timeOut = setTimeout(() => {
                state.removeToken(userToken, () => { })
            }, timeOutDuration)
            state.addToken({ userToken, timeOutID: timeOut })
            resolve(userToken.token)
        } else {
            reject('Email no enviado')
        }
    })
}

/**
 * Autentica el token de un usuario.
 * 
 * @param {Object} param - Objeto que contiene el valor del token.
 * @param {string} param.token - Valor del token a autenticar.
 * @returns {boolean} - Retorna `true` si el token es válido, de lo contrario `false`.
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
 * Personaliza un documento HTML para insertar valores dinámicos.
 * 
 * @param {Object} param - Parámetros para personalizar el HTML.
 * @param {string} param.path - Ruta del archivo HTML.
 * @param {Array} param.matches - Lista de objetos para hacer coincidencias con el HTML, { match: { id: 'token', value: 'Token' } }.
 * @returns {Promise<{ type: string, message: string, data: { html: string, time: string } }>} - Promesa con un objeto que indica éxito o error, y los datos HTML generados.
 */
export const customHTML = async ({ path, matches }) => {
    const contentHTML = new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) reject({ type: 'error', message: err });
            resolve(data)
        })
    })

    const dateInit = new Date().getMilliseconds()
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
                    resolve({ type: 'success', message: 'Coincidencia exitosa', data: { row: target, index: index, ...match } })
                }
            }
            reject({ type: 'error', message: 'Error en la coincidencia', data: { ...match } })
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
                        resolve({ type: 'success', message: 'Configurado exitosamente' })
                    }
                    reject({ type: 'error', message: 'Error en la configuración' })
                })
            }))
                .then(() => {
                    const dateEnd = new Date().getMilliseconds()
                    resolve({ type: 'success', message: 'Todo configurado exitosamente', data: { html: rows.join('\n'), time: `${(dateEnd - dateInit)} milisegundos` } })
                })
                .catch(err => reject({ type: 'error', message: err }))
        })
            .catch(err => reject({ type: 'error', message: err }))
    })
}