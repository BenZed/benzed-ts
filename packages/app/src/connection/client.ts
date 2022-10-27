import Connection from './connection'

/*** Server ***/

class Client extends Connection {

    readonly type = `client` as const

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