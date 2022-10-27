import { ServiceModule, Module, Modules, CommandModule } from './modules'

import { 

    Connection, 

    Client, 
    ClientSettings, 
    DEFAULT_CLIENT_SETTINGS, 
    
    Server, 
    ServerSettings,
    DEFAULT_SERVER_SETTINGS, 

} from './connection'

import { Command } from './command'

import { pluck } from '@benzed/array'
import { Empty } from '@benzed/util'
import is from '@benzed/is'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** App Settings ***/

type AppSettings<M extends Modules> = M extends [ infer Mx, ...infer Mr]
    ? Mx extends Connection<infer O> 
        ? O 
        : Mr extends Modules 
            ? AppSettings<Mr> 
            : Empty
    : Empty

/*** App ***/

class App<M extends Modules = Modules> extends ServiceModule<Command, M, AppSettings<M>> 
    implements Omit<Connection, '_started' | 'parentTo'> {

    // Sealed Construction 

    static create(): App<[]> {
        return new App([])
    }

    private constructor(
        modules: M
    ) {
        super(modules, {} as AppSettings<M>) 
    }
    
    // Connection Interface

    get connection(): Connection {
        return this.get(Connection<any,any>, true)
    }

    get active(): boolean {
        return this.has(Connection) ? this.connection.active : false
    }

    get settings(): AppSettings<M> {
        return (this.has(Connection) ? this.connection.settings : {}) as AppSettings<M>
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

    // Command Implementation 
    
    _execute(command: Command): any {
        const module = this
            .commandModules
            .find(m => m.canExecute(command)) as CommandModule

        return module.execute(command)
    }

    canExecute(command: Command): command is Command {
        return this
            .commandModules
            .some(m => m.canExecute(command))
    }

    // Build Interface
    
    use<Mx extends Module<any>>(
        ...args: Mx extends ServiceModule<any,any> 
            ? [path: string, module: Mx] | [module: Mx] 
            : [module: Mx]
    ): App<[...M, Mx]> {

        const path = pluck(args, is.string).at(0) 
        let module = pluck(args, m => is(m, Module)).at(0) as Mx | undefined
        if (!module)
            throw new Error(`${Module.name} not provided.`)

        module = path && module instanceof ServiceModule
            ? module.parentToWithPath(this, path)
            : module.parentTo(this)

        return new App([
            ...this.modules.map(m => m.parentTo(this)) as unknown as M, 
            module
        ])
    }

    server(settings: Partial<ServerSettings> = {}): App<[Server]> {
        return this.use(
            new Server({
                ...DEFAULT_SERVER_SETTINGS,
                ...settings
            })
        ) as any
    } 

    client(settings: Partial<ClientSettings> = {}): App<[Client]> {
        return this.use(
            new Client({
                ...DEFAULT_CLIENT_SETTINGS,
                ...settings
            })
        ) as any
    } 

}

/*** Export ***/

export default App 

export {
    App
}