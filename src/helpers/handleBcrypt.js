import {hash, compare} from 'bcrypt'

const saltRounds = 10

export const encrypt = (text) => {
    return hash(text, saltRounds)
}

export const decrypt = (text, encryptedText) => {
    return compare(text, encryptedText)
}