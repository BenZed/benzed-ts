import { 
    Module, 
    Modules, 
} from './module'

import { 
    CommandModule, 
    Service,
} from './service'

import { 

    Connection, 

    Client, 
    ClientSettings, 
    
    Server, 
    ServerSettings,

} from './modules'

import { Path } from './types'
import { Command } from './command'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type _RemoveModule<Mx extends Module, M extends Modules> = 
    M extends [infer Mf, ...infer Mr]
        ? Mf extends Mx 
            ? Mr
            : Mr extends Modules 
                ? [Mf, ..._RemoveModule<Mx, Mr>]
                : [Mf]
        : []

type _RemoveConnection<M extends Modules> = _RemoveModule<Client | Server, M>

type _HasModule<Mx extends Module, M extends Modules> = M extends [infer Mf, ...infer Mr]
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

//// App ////

type AppConnection = Omit<Connection<object>, 'copy' | 'settings' | '_copyWithParent' | symbol>

/**
 * Immutable builder pattern for apps and services
 */
class App<M extends Modules = Modules> extends CommandModule<M> implements AppConnection {

    // Sealed Construction 

    static create(): App<[]> {
        return new App([])
    }

    private constructor(
        modules: M
    ) {
        super(modules)
    }
    
    // Connection Interface

    get connection(): _GetConnection<M> {
        return this.get(Connection<any>, true) as _GetConnection<M>
    }

    /**
     * The connection type of this App. Null if
     * it has not yet been assigned.
     */
    get type(): _GetType<M> {
        return (this.has(Connection) ? this.connection.type : null) as _GetType<M>
    }

    getCommand(name: string): Command {

        if (name in this.commands)
            return this.commands[name as keyof typeof this.commands] as Command

        throw new Error(`Command ${name} could not be found.`)
    }
    
    // Build Interface

    override use<Px extends Path, S extends Service<any>>(
        path: Px,
        module: S
    ): App<[...M, S extends Service<any, infer Mx> ? Service<Px, Mx> : never]>

    override use<Mx extends Module>(
        module: Mx
    ): App<[...M, Mx]>

    override use<Mx extends Module>(
        ...args: Mx extends Service<any> 
            ? [path: string, module: Mx] | [module: Mx] 
            : [module: Mx]
    ): App<[...M, Mx]> {
        return new App(
            this._pushModule(...args)
        )
    }

    server(settings: ServerSettings = {}): App<[..._RemoveConnection<M>, Server]> {
        return this
            .generic()
            .use(
                Server.create(settings)
            ) 
    } 

    client(settings: ClientSettings = {}): App<[..._RemoveConnection<M>, Client]> {
        return this
            .generic()
            .use(
                Client.create(settings)
            ) 
    }

    /**
     * Remove the connection from this App
     */
    generic(): App<_RemoveConnection<M>> {
        const modules = this.modules.filter(m => m instanceof Connection === false)
        return new App(modules as _RemoveConnection<M>)
    }

    /**
     * Remove the connection modules from this App and convert to a service.
     * Useful for nesting.
     */
    service(): Service<'/', _RemoveConnection<M>> {
        return this
            .modules
            .filter(module => module instanceof Connection === false)
            .reduce((service: any, module: any) => service.use(module), Service.create())
    }

}

/*** Export ***/

export default App 

export {
    App
}