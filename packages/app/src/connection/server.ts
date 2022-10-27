import Connection from './connection'

/*** Server ***/

class Server extends Connection {

    readonly type = `server`

    start(): Promise<void> {
        return Promise.resolve()
    }

    stop(): Promise<void> {
        return Promise.resolve()
    }

}

/*** Exports ***/

export default Server

export {
    Server
}