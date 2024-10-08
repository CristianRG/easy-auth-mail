// TODO: Importa las funciones (las rutas son relativas, por lo que no deberias copiar estas importaciones)
import { authenticateToken, authenticateUser, createMailOptions, createTransport } from "../index.js"
import UserToken from "../models/UserToken.js"
import dotenv from 'dotenv'
import path from 'path'
dotenv.config()
// carga las variables de entorno
const user = process.env.MAIL_SENDER
const pass = process.env.PASS_SENDER

// crea el transportador (te permitira conectarte con tu servicio de mail)
// indica que tipo de servicio quieres utiliza e ingresa las credenciales para utilizar tu correo
const transport = createTransport({ service: 'gmail', auth: { user: user, pass: pass } })
// en tu aplicación, como en un endpoint, puedes crear un objeto de tipo UserToken una vez obtengas las credenciales
const userToken = new UserToken({ user: { email: 'maildestinatario@dominio.com', password: 'contraseñadestinatario' } })
// genera el token. Esto tambien encrypta la contraseña
userToken.generateToken()
// crea las opciones del mail, como el correo a quien va dirigido, el asunto y el documento a insertar en caso de haberlo
// indicamos que existe un documento HTML e introducimos la ruta donde se encuentra
// en el documento HTML podemos ingresar un id para las etiquetas y al cargarlo podemos ingresar un valor dentro de dichas etiquetas
const mailOptions = await createMailOptions({
    sender: { mail: user }, user: { mail: userToken.email, token: userToken.token }, content: {
        subject: 'Confirmación de correo', html: {
            path: path.join(process.cwd(), 'src', 'html', 'index.html'),
            matches: [
                { match: { id: 'user', value: `¡Hola, ${userToken.email}, gracias por registrarte!` } }, 
                { match: { id: 'token', value: userToken.token } }
            ]
        }
    }
})
// envía el correo para autentificar el usuario. Esta función retorna el token del usuario en caso de que el correo haya sido enviado
// agrega el token a un "estado" -> lista; donde se mantendrá hasta que ingrese su token o se elimine automaticamente
const tokenString = await authenticateUser({ userToken, transport, mailOptions, config: { timeOutDuration: (1000 * 60 * 5) } }) // el tiempo de duración es de 5 minutos
// en tu aplicación, como en un endpoint, puedes verificar que el token sea correcto. Usaremos el valor obtenido anteriormente
const isAuthenticated = authenticateToken({ token: tokenString }) // retorna true o false en caso de estar o no registrado el token
console.log(isAuthenticated) // imprime true o false