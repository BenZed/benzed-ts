import { Module, Modules } from './modules'

import { 
    Client, 
    ClientOptions, 

    Server, 
    ServerOptions,

    Connection, 
    DEFAULT_SERVER_OPTIONS, 
    DEFAULT_CLIENT_OPTIONS, 

} from './connection'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** App ***/

abstract class Service<M extends Modules> extends Module {

}

class App<M extends Modules> extends Module implements Omit<Connection, '_started'> {

    get options(): object {
        return this.connection.options
    }

    // Sealed Construction 

    static create(): App<[]> {
        return new App([])
    }

    use<Mx extends Module>(
        Constructor: new (modules: Modules) => Mx
    ): App<[...M, Mx]>{

        // Each component gets a refreshed list of components that doesn't include itself
        const components = [...this.components, new Constructor(this.components)] 

        for (let i = 0; i <= this.components.length; i++) {
            components[i] = new (components[i].constructor as new (modules: Modules) => Module)(
                components.filter(c => c !== components[i])
            )
        }

        return new App(components as [...M, Mx])
    }
    
    private constructor(
        modules: M
    ) {
        super(modules) 
    }
    
    // Connection Interface

    get connection(): Connection {
        return this.get(Connection)
    }

    get active(): boolean {
        return this.has(Connection) ? this.connection.active : false
    }

    /**
     * The connection type of this App. Null if
     * it has not yet been assigned.
     */
    get type(): 'server' | 'client' | null {
        return this.has(Connection) ? this.connection.type : null
    }
    
    async start(): Promise<void> {
        await this.connection.start()
    }
    
    async stop(): Promise<void> {
        await this.connection.stop()
    }

    // Build Interface

    client(options: ClientOptions = DEFAULT_CLIENT_OPTIONS): App<[]> {
        return this.use(
            Client.withOptions(options)
        )
    }

    server(options: ServerOptions = DEFAULT_SERVER_OPTIONS): App<[]> {
        return this.use(
            Server.withOptions(options)
        )
    }

}

/*** Export ***/

export default App 

export {
    App
}