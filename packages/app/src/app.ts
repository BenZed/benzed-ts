import { Command, CommandResult } from './command'
import { Client, ClientOptions, Connection, Server, ServerOptions } from './connection'

/*** App ***/

class App implements Omit<Connection, '_started'> {

    // Sealed Construction 

    static create(): App {
        return new App(null)
    }
    
    private constructor(
        private readonly _connection: Connection | null = null
    ) { /**/ }
    
    // Connection Interface

    get connection(): Connection {
        if (!this._connection) {
            throw new Error(
                `${this.constructor.name} does not ` + 
                `have a ${Connection.name} instance.`)
        }
        return this._connection
    }

    /**
     * The connection type of this App. Null if
     * it has not yet been assigned.
     */
    get type(): 'server' | 'client' | null {
        return this._connection?.type ?? null
    }
    
    async start(): Promise<void> {
        await this.connection.start()
    }
    
    async stop(): Promise<void> {
        await this.connection.stop()
    }

    command(command: Command): Promise<CommandResult> {
        return Promise.resolve(command)
    }

    // Build Interface

    client(options?: ClientOptions): App {
        return new App(
            new Client(options)
        )
    }

    server(options?: ServerOptions): App {
        return new App(
            new Server(options)
        )
    }

}

/*** Export ***/

export default App 

export {
    App
}