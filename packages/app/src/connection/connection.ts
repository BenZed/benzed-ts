
/**
 * Base class for creating connections either to or from the server.
 */
export abstract class Connection {

    abstract readonly type: `server` | `client`

    abstract start(): Promise<void>

    abstract stop(): Promise<void>

}

export default Connection