import UserToken from "./UserToken.js"

class StateToken {
    constructor(){
        if(!StateToken.instance){
            this.state = []
            StateToken.instance = this
        }
        return StateToken.instance
    }
    /**
     * @param {Object} param
     * @param {UserToken} param.userToken
     * @param {*} param.timeOutID
     */
    addToken({userToken, timeOutID}){
        const indexOf = this.state.findIndex(token => token.userToken.token === userToken.token)
        if(indexOf === -1){
            this.state.push({userToken: {...userToken}, timeOutID: {...timeOutID}})
        }
    }
    /**
     * @param {UserToken} userToken
     * @param {Function} callback 
     */
    removeToken(userToken, callback){
        const indexOf = this.state.findIndex(token => token.userToken.token === userToken.userToken.token)
        if(indexOf !== -1){
            const token = this.state.splice(indexOf, 1)
            callback(token[0])
        }
    }
    /**
     * @param {String} userToken - `String` con el valor del token
     * @returns {UserToken | null} retorna el `token` o `null` en caso de no encontrarlo
     */
    getToken(userToken){
        const indexOf = this.state.findIndex(token => token.userToken.token === userToken)
        if(indexOf !== -1){
            return this.state[indexOf]
        }
        return null
    }
}

export default StateToken