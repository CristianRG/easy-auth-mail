
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
import { authenticateToken, authenticateUser, createTransport } from "../index.js"
import UserToken from "../models/UserToken.js"
import dotenv from 'dotenv'
dotenv.config()
const user = process.env.MAIL_SENDER
const pass = process.env.PASS_SENDER

const transporter = createTransport({ service: 'gmail', auth: { user: user, pass: pass } }) // Create a new transport to authenticate the sender
const token = await authenticateUser({ user: { mail: 'receptoremail@domain.com', password: 'receptorpasswordinyourapp' }, sender: user, transporter }) // Authenticate the user by mail sending a token
// Example
// In case that receive a token in your app. This will be true cause the dependence just show if your service accepted to send the message always 
// receptor mail was wrong or not exits. Dont use this code above in production you can use this code inside a route in express where you receive a 
// token as parameter
const tokenReceived = new UserToken({ user: { email: null, password: null } }) // create a object
tokenReceived.token = token // set token received
const isAuthenticated = authenticateToken({ token: tokenReceived }) // check if token exits. Return true or false
console.log("Is authenticated: ", isAuthenticated) // print true or false
```


## License

[MIT](https://choosealicense.com/licenses/mit/)