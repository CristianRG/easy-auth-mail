import { authenticateToken, authenticateUser, createTransport } from "../index.js"
import UserToken from "../models/UserToken.js"
import dotenv from 'dotenv'
dotenv.config()
const user = process.env.MAIL_SENDER
const pass = process.env.PASS_SENDER

const transporter = createTransport({ service: 'gmail', auth: { user: user, pass: pass } }) // Create a new transport to authenticate the sender
const token = authenticateUser({ user: { mail: 'rizogomezalexander@gmail.com', password: '123456789' }, sender: user, transporter }) // Authenticate the user by mail sending a token

// Example
// In case that receive a token in your app
const tokenReceived = new UserToken({ user: { email: null, password: null } }) // create a object
tokenReceived.token = token // set token received
const isAuthenticated = authenticateToken({ token: tokenReceived }) // check if token exits. Return true or false
console.log("Is authenticated: ", isAuthenticated) // print true or false