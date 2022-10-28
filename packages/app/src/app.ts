import { 
    ServiceModule, 
    Module, 
    Modules, 
    ServiceCommands,
    ModulesOf 
} from './modules'

import { 

    Connection, 

    Client, 
    ClientSettings, 
    DEFAULT_CLIENT_SETTINGS, 
    
    Server, 
    ServerSettings,
    DEFAULT_SERVER_SETTINGS, 

} from './connection'

import { 
    ToServerCommand 
} from './connection/server/koa-server'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** Types ***/

type AppSettings<M extends Modules | App<any>> = M extends App<infer Mx>
    ? AppSettings<Mx> 
    : M extends [ infer Mx, ...infer Mr]
        ? Mx extends Connection<any, infer O> 
            ? O 
            : Mr extends Modules 
                ? AppSettings<Mr> 
                : never
        : never

type AppCommands<A extends App | Modules> = 
    Exclude<
    A extends App<infer M> 
        // Do not include connection commands for type safety.
        // Connection commands are generic because they're sending/receiving them
        // them over a network boundary
        ? ServiceCommands<_RemoveConnection<M>> 
        : AppCommands<A>,

    ToServerCommand
    >

/*** Helper Types ***/

type _RemoveModule<Mx extends Module<any>, M extends Modules> = 
    M extends [infer Mf, ...infer Mr]
        ? Mf extends Mx 
            ? Mr
            : Mr extends Modules 
                ? [Mf, ..._RemoveModule<Mx, Mr>]
                : [Mf]
        : []

type _RemoveConnection<M extends Modules> = _RemoveModule<Client | Server, M>

/*** App ***/

type AppConnection = Omit<Connection<any,any>, '_started' | symbol>

/**
 * Immutable builder pattern for apps and services
 */
class App<M extends Modules = Modules> extends ServiceModule<M, AppSettings<M>> implements AppConnection {

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

    override get settings(): AppSettings<M> {
        return (
            this.has(Connection) 
                ? this.connection.settings 
                : {}
        ) as AppSettings<M>
    }

    /**
     * The connection type of this App. Null if
     * it has not yet been assigned.
     */
    get type(): 'server' | 'client' | null {
        return this.has(Connection) ? this.connection.type : null
    }

    // Build Interface

    override use<Mx extends Module<any>>(
        ...args: Mx extends ServiceModule<any,any> 
            ? [path: string, module: Mx] | [module: Mx] 
            : [module: Mx]
    ): App<[...M, Mx]> {
        return new App(
            this._pushModule(...args)
        )
    }

    server(settings: Partial<ServerSettings> = {}): App<[..._RemoveModule<Client | Server, M>, Server]> {
        return this
            .service()
            .use(
                new Server({
                    ...DEFAULT_SERVER_SETTINGS,
                    ...settings
                })
            ) 
    } 

    client(settings: Partial<ClientSettings> = {}): App<[..._RemoveModule<Client | Server, M>, Client]> {
        return this
            .service()
            .use(
                new Client({
                    ...DEFAULT_CLIENT_SETTINGS,
                    ...settings
                })
            ) 
    } 

    /**
     * Ensure this app has no connection module, essentially reducing it to a service.
     * Convenient for nesting.
     */
    service(): App<_RemoveModule<Client | Server, M>> {

        const modules = this.modules.filter(m => m instanceof Connection === false)

        return new App(modules as unknown as _RemoveModule<Client | Server, M>)
    }

}

/*** Export ***/

export default App 

export {
    App,
    ModulesOf as AppModules,
    AppSettings,
    AppCommands
}