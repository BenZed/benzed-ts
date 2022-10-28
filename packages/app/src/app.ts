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

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** Types ***/

type AppSettings<M extends Modules | App<any>> = M extends App<infer Mx>
    ? AppSettings<Mx> 
    : M extends [ infer Mx, ...infer Mr]
        ? Mx extends Connection<infer O> 
            ? O 
            : Mr extends Modules 
                ? AppSettings<Mr> 
                : never
        : never

type AppCommands<A extends App | Modules> = 
    A extends App<infer M> 
        ? ServiceCommands<M> 
        : ServiceCommands<A>

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

type _HasModule<Mx extends Module<any>, M extends Modules> = M extends [infer Mf, ...infer Mr]
    ? Mf extends Mx 
        ? true
        : Mr extends Modules 
            ? _HasModule<Mx, Mr>
            : true
    : false

type _GetConnection<M extends Modules> = _HasModule<Server, M> extends true 
    ? Server 
    : _HasModule<Client, M> extends true 
    
        ? Client 
        : never

type _GetType<M extends Modules> = _HasModule<Server, M> extends true 
    ? `server` 
    : _HasModule<Client, M> extends true 

        ? `client` 
        : null

/*** App ***/

type AppConnection = Omit<Connection<any>, '_started' | symbol>

/**
 * Immutable builder pattern for apps and services
 */
class App<M extends Modules = Modules> 
    extends ServiceModule<M, AppSettings<M>> 
    implements AppConnection {

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

    get connection(): _GetConnection<M> {
        return this.get(Connection<any>, true) as _GetConnection<M>
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
    get type(): _GetType<M> {
        return (this.has(Connection) ? this.connection.type : null) as _GetType<M>
    }

    // Command interface 

    override execute(command: ServiceCommands<M>): Promise<object> {
        const client = this.get(Client)
        if (client)
            return client.executeOnServer(command)

        return super.execute(command)
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

    server(settings: Partial<ServerSettings> = {}): App<[..._RemoveConnection<M>, Server]> {
        return this
            .service()
            .use(
                new Server({
                    ...DEFAULT_SERVER_SETTINGS,
                    ...settings
                })
            ) 
    } 

    client(settings: Partial<ClientSettings> = {}): App<[..._RemoveConnection<M>, Client]> {
        return this
            .service()
            .use(
                new Client({
                    ...DEFAULT_CLIENT_SETTINGS,
                    ...settings
                })
            ) 
    } 

    getCommandList(): Promise<string[]> {
        return this.connection.getCommandList()
    }

    /**
     * Ensure this app has no connection module, essentially reducing it to a service.
     * Convenient for nesting.
     */
    service(): App<_RemoveConnection<M>> {

        const modules = this.modules.filter(m => m instanceof Connection === false)

        return new App(modules as unknown as _RemoveConnection<M>)
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