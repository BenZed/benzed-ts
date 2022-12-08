import { pluck } from '@benzed/array'
import { KeysOf, Merge, nil, Infer } from '@benzed/util'
import { capitalize, ToCamelCase, toCamelCase } from '@benzed/string'

import { $path, Path, UnPath } from './util/types'

import { 
    Module, 
    Modules,
} from './module'

import { 
    Client, 
    Server,
    CommandModule
} from './modules'

import is from '@benzed/is'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Commands Type ////

type _ServiceCommand<M extends Module, P extends string> = 
    M extends Service<infer Px, infer Mx> 
        ? _ServiceCommands<Mx, ToCamelCase<[P, UnPath<Px>]>>
        : M extends CommandModule<infer N, any, any> 
            ? { [K in N as ToCamelCase<[P, N], '-'>]: M }
            : {}

type _ServiceCommands<M extends Modules, P extends string> = M extends [infer Mx, ...infer Mr] 
    ? Mx extends Module 
        ? Mr extends Modules 
            ? _ServiceCommand<Mx, P> & _ServiceCommands<Mr, P>
            : _ServiceCommand<Mx, P>
        : {}
    : {}

type ServiceCommands<M> = Merge<[
    M extends ServiceModule<infer Mx> 
        ? _ServiceCommands<Mx, ''>
        : M extends Modules 
            ? _ServiceCommands<M, ''>
            : M extends Module 
                ? _ServiceCommand<M, ''> 
                : never
]>

type _ServiceAtPath<M, P extends string, R extends boolean> = M extends Service<infer Px, infer Mx> 
    ? { [K in `${P}${Px}`]: M } & (R extends true ? _ServicesAtPaths<Mx, `${P}${Px}`, true> : {})
    : {}

type _ServicesAtPaths<M, P extends string, R extends boolean> = M extends [infer Sx, ...infer Sr] 
    ? Sr extends Modules
        ? _ServiceAtPath<Sx, P, R> & _ServicesAtPaths<Sr, P, R>
        : _ServiceAtPath<Sx, P, R>
    : {}

type NestedPaths<M extends Modules> = KeysOf<_ServicesAtPaths<M, '', true>>

// type Paths<M extends Modules> = KeysOf<_ServicesAtPaths<M, '', false>>

type ServiceAtNestedPath<M extends Modules, P extends NestedPaths<M>> = _ServicesAtPaths<M, '', true>[P]

// type ServiceAtPath<M extends Modules, P extends Paths<M>> = _ServicesAtPaths<M, '', false>[P]

//// Service ////

/**
 * @internal
 */
export type _FlattenModules<M extends Modules> = 
    M extends [infer Mx, ...infer Mr]
        ? Mx extends Module
            ? Mr extends Modules 
                ? Mx extends ServiceModule<infer Mrx> 
                    ? _FlattenModules<[...Mrx, ...Mr]>
                    : [Mx, ..._FlattenModules<Mr>]
                : Mx extends ServiceModule<infer Mrx> 
                    ? _FlattenModules<Mrx>
                    : [Mx]
            : []
        : [] 

/**
 * @internal
 */ 
export type _ToService<P extends Path, S extends ServiceModule> = S extends ServiceModule<infer M>
    ? Service<P, M>
    : never

/**
 * Get the Module types of a Service Module
 */
export type ModulesOf<S extends ServiceModule<any>> = S extends ServiceModule<infer M> ? M : never

/**
 * Contains other modules, provides an interface for grouping and executing their commands.
 */
export abstract class ServiceModule<M extends Modules = any> extends Module {

    private readonly _modules: M
    override get modules(): M {
        return this._modules
    }

    constructor(
        modules: M,
    ) {
        super()

        this._modules = modules.map(m => m._copyWithParent(this)) as unknown as M
        this._validateModules()
    }

    protected override get _copyParams(): unknown[] {
        return [this.modules]
    }

    //// Lifecycle Methods ////

    override async start(): Promise<void> {
        await super.start()
        await Promise.all(this.modules.map(m => m.start()))
    }

    override async stop(): Promise<void> {
        await super.stop()
        await Promise.all(this.modules.map(m => m.stop()))
    }

    //// Service Implementation ////

    // abstract useService<P extends ServiceAtNestedPath<M>>(path: P,module: Mx): unknown
    abstract useService<P extends Path, Mx extends ServiceModule<any>>(
        path: P,
        module: Mx
    ): unknown

    // abstract useModule<Mx extends Module, I extends IndexesOf<M>, F extends (module: M[I]) => Mx>(index: I, updater: F): unknown
    abstract useModule<Mx extends Module>(module: Mx): unknown

    // abstract useModules<Mx extends Modules, F extends (modules: M) => Mx>(updater: F): unknown
    abstract useModules<Mx extends Modules>(...modules: Mx): unknown
    
    getService<P extends NestedPaths<M>>(path: P): ServiceAtNestedPath<M, P> {
  
        const service = this._getService(path as Path)
        if (!service)
            throw new Error(`No service registered at path '${path}'`)

        return service as ServiceAtNestedPath<M, P> 
    }

    private _commands: _ServiceCommands<M, ''> | nil = nil
    get commands(): ServiceCommands<M> {
        return this._commands ?? this._createCommands() as any
    }

    get client(): Client | nil {
        return this.root.getModule(Client) ?? nil
    }
    
    get server(): Server | nil {
        return this.root.getModule(Server) ?? nil
    }

    //// Module Implementation ////

    override _validateModules(): void {
        this.modules.forEach(m => m._validateModules())
        this._assertNoCommandNameCollisions()
    }

    private _assertNoCommandNameCollisions(): void {
        // commands throw on collision during creation anyway
        void this._createCommands()
    }

    //// Helper ////
    
    protected _pushModule(
        ...args: [path: Path, module: Module] | [module: Module] | Modules
    ): Modules {

        const string = pluck(args, is.string).at(0) as string | undefined
        const path = string ? $path.validate(string) : nil

        const inputModules = args as Module[]
        if (inputModules.length === 0)
            throw new Error(`${Module.name} not provided.`)

        const newModules: Module[] = []
        for (const module of inputModules) {
            const isService = module instanceof ServiceModule<any>

            newModules.push(...isService && path
                ? [Service._create(path, module._modules)]
                : isService 
                    ? module.modules 
                    : [module]
            )

            if (path && !isService)
                throw new Error(`${module.name} is not a service, and cannot be used at path: ${path}`)
        }

        return [ ...this.modules, ...newModules ]
    }

    private _createCommands(): _ServiceCommands<M, ''> {

        const commands: { [key: string]: CommandModule<string, object, object> } = {}

        const setCommand = (name: string, command: CommandModule<string, object, object>): void => {
            if (name in commands)
                throw new Error(`Command name collision: "${name}" is used multiple times`)

            commands[name] = command
        }

        for (const module of this.modules) {

            if (module instanceof ServiceModule) {
                for (const key in module.commands) {
    
                    const name: string = module instanceof Service
                        ? `${module.path.replaceAll('/', '')}${capitalize(key)}`
                        : key

                    setCommand(name, module.commands[key as keyof typeof module.commands])
                }
            } else if (module instanceof CommandModule) {
                
                const name = toCamelCase(module.name)
                setCommand(name, module)
            }

        }

        this._commands = commands as _ServiceCommands<M, ''>
        return this._commands
    }

    private _getService(path: Path): Service<Path, Modules> | nil {
  
        const services = this.modules.filter((m): m is Service<Path, Modules> => m instanceof Service)
        for (const service of services) {
            if (service.path === path)
                return service   
            
            const subPath = path.replace(service.path, '') as Path
            const subService = service._getService(subPath)
            if (subService)
                return subService
        }

        return nil
    }

}

//// Service ////

/**
 * Service 
 */
export class Service<P extends Path, M extends Modules = any> extends ServiceModule<M> {

    //// Sealed ////

    /**
     * Create a service with a given path and set of modules
     * @internal
     */
    static _create<Px extends Path, Mx extends Modules>(path: Px, modules: Mx): Service<Px, Mx> {
        return new Service(path, modules)
    }

    /**
     * Create a new empty service
     * @returns Service
     */
    static create(): Service<'/', []> {
        return new Service('/', [])
    }
  
    private constructor(
        private readonly _path: Path,
        modules: M
    ) {
        super(modules)
    }

    //// Command Module Implementation ////
    
    get path(): P {
        return this._path as P
    }

    override useService<Px extends Path, S extends ServiceModule<any>>(
        path: Px,
        module: S
    ): Service<P, [...M, _ToService<Px ,S>]> {
        return Service._create(
            this._path,
            this._pushModule(path, module)
        ) as Service<P, [...M, _ToService<Px ,S>]> 
    }

    override useModule<Mx extends Module>(
        module: Mx
    ): Service<P, [...M, ..._FlattenModules<[Mx]>]> {
        return Service._create(
            this._path,
            this._pushModule(module)
        ) as Service<P, [...M, ..._FlattenModules<[Mx]>]> 
    }

    override useModules<Mx extends Modules>(
        ...modules: Mx
    ): Service<P, [...M, ..._FlattenModules<Mx>]> {
        return Service._create(
            this._path,
            this._pushModule(...modules)
        ) as Service<P, [...M, ..._FlattenModules<Mx>]> 
    }

    //// Module Implementation ////

    protected override get _copyParams(): unknown[] {
        return [this._path, this.modules]
    }
}
