import { ServiceModule, Module, Modules, CommandModule, $$parentTo } from './modules'

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

type AppSettings<M extends Modules | App<any>> = M extends App<infer Mx>
    ? AppSettings<Mx> 
    : M extends [ infer Mx, ...infer Mr]
        ? Mx extends Connection<any, infer O> 
            ? O 
            : Mr extends Modules 
                ? AppSettings<Mr> 
                : Empty
        : Empty

type AppModules<A extends App> = A extends App<infer M> ? M : unknown

type _AppCommandArray<M extends Modules | App<any>> = 
    M extends App<infer Mx>
        ? _AppCommandArray<Mx>
        : { [K in keyof M]: M[K] extends CommandModule<infer C, any> 
            ? C 
            : Empty }

type AppCommands<M extends Modules | App<any>> = _AppCommandArray<M>[number]

type RemoveModule<Mx extends Module<any>, M extends Modules> = 
    M extends [infer Mf, ...infer Mr]
        ? Mf extends Mx 
            ? Mr
            : Mr extends Modules 
                ? [Mf, ...RemoveModule<Mx, Mr>]
                : [Mf]
        : []

/*** App ***/

/**
 * Immutable builder pattern for apps and services
 */
class App<M extends Modules = Modules> 
    extends ServiceModule<Command, M, AppSettings<M>> 
    implements Omit<Connection<any,any>, '_started' | symbol> {

    // Sealed Construction 

    static create(): App<[]> {
        return new App([])
    }

    private constructor(
        modules: M
    ) {
        super(modules, {} as AppSettings<M>) 
        this.validateModules()
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
    
    override async start(): Promise<void> {
        await this.connection.start()
    }
    
    override async stop(): Promise<void> {
        await this.connection.stop()
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

        if (path && module instanceof ServiceModule)
            module = module[$$parentTo](this, path)

        return new App([
            ...this.modules, 
            module
        ])
    }

    server(settings: Partial<ServerSettings> = {}): App<[...RemoveModule<Client | Server, M>, Server]> {
        return this
            .generic()
            .use(
                new Server({
                    ...DEFAULT_SERVER_SETTINGS,
                    ...settings
                })
            ) 
    } 

    client(settings: Partial<ClientSettings> = {}): App<[...RemoveModule<Client | Server, M>, Client]> {
        return this
            .generic()
            .use(
                new Client({
                    ...DEFAULT_CLIENT_SETTINGS,
                    ...settings
                })
            ) 
    } 

    /**
     * Ensure this app has no connection module, which is important if it is going to be 
     * nested.
     */
    generic(): App<RemoveModule<Client | Server, M>> {

        const modules = this.modules.filter(m => m instanceof Connection === false)

        return new App(modules as unknown as RemoveModule<Client | Server, M>)
    }

    // Module Implementation 

    override validateModules(): void {
        this.modules.forEach(m => m.validateModules())
    }

    // Helper 

}

/*** Export ***/

export default App 

export {
    App,
    AppModules,
    AppSettings,
    AppCommands
}