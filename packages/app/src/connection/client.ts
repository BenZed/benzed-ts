import Connection from './connection'

/*** Server ***/

class Client extends Connection {

    readonly type = `client`

    start(): Promise<void> {
        return Promise.resolve()
    }

    stop(): Promise<void> {
        return Promise.resolve()
    }

}

/*** Exports ***/

export default Client

export {
    Client
}