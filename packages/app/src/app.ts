import { AppModule, AppModules } from './app-module'

import type { Command, CommandResult } from './command'

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

class App<M extends AppModules> extends AppModule implements Omit<Connection, '_started'> {

    get options(): object {
        return this.connection.options
    }

    // Sealed Construction 

    static create(): App<[]> {
        return new App([])
    }

    use<Mx extends AppModule>(
        Constructor: new (modules: AppModules) => Mx
    ): App<[...M, Mx]>{

        // Each component gets a refreshed list of components that doesn't include itself
        const components = [...this.components, new Constructor(this.components)] 

        for (let i = 0; i <= this.components.length; i++) {
            components[i] = new (components[i].constructor as new (modules: AppModules) => AppModule)(
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
        return this.get(Connection) as Connection
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

    compute(command: Command): CommandResult | Promise<CommandResult>{
        if (this.has(Connection))
            return this.connection.compute(command)

        return this._invokeCommand(command)
    }

    // Build Interface

    client(options: ClientOptions = DEFAULT_CLIENT_OPTIONS): App<[]> {
        return this.use(
            Client.withOptions(options)
        )
    }

    server(options: ServerOptions = DEFAULT_SERVER_OPTIONS): App<[]> {

        const { _invokeCommand: invokeCommand } = this

        return this.use(
            Server.withOptions(options, invokeCommand)
        )
    }

    // Helper

    private _invokeCommand(command: Command): CommandResult | Promise<CommandResult> {

        for (const component of this.components) 
            console.log(`${App.name} ${this.type} ${component.constructor.name} ${command}`)
        
        return command
    }

}

/*** Export ***/

export default App 

export {
    App
}