import dotenv from 'dotenv'
dotenv.config()
export const conf = {
    sender: process.env.MAIL_SENDER,
    pass: process.env.PASS_SENDER
}