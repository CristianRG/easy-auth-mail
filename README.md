
# Easy-auth-mail

## Descripción

Al desarrollar una aplicación web que requiere el registro de usuarios es necesario implementar un método de autentificación para evitar que se utilicen correos electronicos falsos que ocupan espacio innecesario en la base de datos.

Para evitar que esto suceda podemos implementar una forma de autentificar que dichos correos son reales enviando un **token** o **código** que debe ser ingresado para completar el registro.






## Instalación

Para clonar el repositorio dentro de tu proyecto utiliza
```bash
  git clone https://github.com/CristianRG/easy-auth-mail.git
```
Instalación de dependencias

npm
```bash
npm install
```
pnpm
```bash
pnpm install
```
yarn
```bash
yarn install
```

## Uso/Ejemplos

Por seguridad, evita escribir tus credenciales de tu servicio de correo electronico directamente en el código. Utiliza variables de entorno con dotenv
#### 1) Instala dotenv en tu proyecto
##### npm
```bash
npm install dotenv
```
##### pnpm
```bash
pnpm add dotenv
```
#### 2) Crea un archivo llamado .env en la raíz de tu proyecto
#### 3) En el archivo creado escribe las siguientas variables

```bash
MAIL_SENDER=<yourmail@domain.com>
PASS_SENDER=<yourpassword>
```
#### 4) Carga las variables de entorno y declara las variables a utilizar en un archivo de configuración o en alguna parte de tu aplicación para utilizarlas posteriormente

```javascript
import dotenv from 'dotenv'
dotenv.config()
const user = process.env.MAIL_SENDER
const pass = process.env.PASS_SENDER
```
#### 5) Finalmente utiliza las funciones del proyecto
```javascript
// TODO: Importa las funciones (las rutas son relativas, por lo que no deberias copiar estas importaciones)
import { authenticateToken, authenticateUser, createMailOptions, createTransport } from "../index.js"
import UserToken from "../models/UserToken.js"
import dotenv from 'dotenv'
dotenv.config()
// carga las variables de entorno
const user = process.env.MAIL_SENDER
const pass = process.env.PASS_SENDER

// crea el transportador (te permitira conectarte con tu servicio de mail)
// indica que tipo de servicio quieres utiliza e ingresa las credenciales para utilizar tu correo
const transport = createTransport({service: 'gmail', auth: {user: user, pass: pass}})
// en tu aplicación, como en un endpoint, puedes crear un objeto de tipo UserToken una vez obtengas las credenciales
const userToken = new UserToken({user: {email: 'maildestinatario@dominio.com', password: 'contraseñadestinatario'}})
// genera el token. Esto tambien encrypta la contraseña
userToken.generateToken()
// crea las opciones del mail, como el correo a quien va dirigido, el asunto y el documento a insertar en caso de haberlo
const mailOptions = await createMailOptions({sender: {mail: user}, user: {mail: userToken.email, token: userToken.token}, content: {
    subject: 'Confirmación de correo'
}})
// envía el correo para autentificar el usuario. Esta función retorna el token del usuario en caso de que el correo haya sido enviado
// agrega el token a un "estado" -> lista; donde se mantendrá hasta que ingrese su token o se elimine automaticamente
const tokenString = await authenticateUser({userToken, transport, mailOptions, config: {timeOutDuration: (1000*60*5)}}) // el tiempo de duración es de 5 minutos
// en tu aplicación, como en un endpoint, puedes verificar que el token sea correcto. Usaremos el valor obtenido anteriormente
const isAuthenticated =authenticateToken({token: tokenString}) // retorna true o false en caso de estar o no registrado el token
console.log(isAuthenticated) // imprime true o false
```


## License

[MIT](https://choosealicense.com/licenses/mit/)