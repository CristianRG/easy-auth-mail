import crypto from 'crypto'
import { encrypt } from '../helpers/handleBcrypt.js'
class UserToken {
    constructor({ user: { email, password } }) {
        this.id = crypto.randomBytes(10).toString('hex')
        this.email = email
        this.password = password
        this.token = null
    }

    async generateToken() {
        if (this.token == null) {
            this.token = crypto.randomBytes(5).toString('hex')
            this.password = await encrypt(this.password)
        }
    }
}

export default UserToken