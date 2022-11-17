import { pluck } from '@benzed/array'
import { Compile, StringKeys } from '@benzed/util'
import { capitalize, ToCamelCase, toCamelCase } from '@benzed/string'

import { Command, CommandInput, CommandModule, CommandOutput } from './command'
import { $path, Path } from './util/types'
import { Module, Modules } from './module'
import { Client, Server } from './modules'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper Types ////

type _Unslash<S extends string> = S extends `/${infer Sx}` ? Sx : S

//// Commands Type ////

type _CommandsOfModule<M extends Module, P extends string> = 
    M extends Service<infer Px, infer Mx> 
        ? _CommandsOfModules<Mx, ToCamelCase<[P, _Unslash<Px>]>>
        : M extends CommandModule<infer N, any, any> 
            ? { [K in N as ToCamelCase<[P, N]>]: M }
            : {}

type _CommandsOfModules<M extends Modules, P extends string = ''> = M extends [infer Mx, ...infer Mr] 
    ? Mx extends Module 
        ? Mr extends Modules 
            ? _CommandsOfModule<Mx, P> & _CommandsOfModules<Mr, P>
            : _CommandsOfModule<Mx, P>
        : {}
    : {}

type ModuleCommands<M extends Modules | Module> = 
    Compile<
    M extends ServiceModule<infer Mx> 
        ? _CommandsOfModules<Mx>
        : M extends Modules 
            ? _CommandsOfModules<M>
            : M extends Module 
                ? _CommandsOfModule<M, ''> 
                : never,
    Function,
    false
    >

//// Command Module ////

export type FlattenModules<M extends Modules> = 
    M extends [infer Mx, ...infer Mr]
        ? Mx extends Module
            ? Mr extends Modules 
                ? Mx extends ServiceModule<infer Mrx> 
                    ? FlattenModules<[...Mrx, ...Mr]>
                    : [Mx, ...FlattenModules<Mr>]
                : Mx extends ServiceModule<infer Mrx> 
                    ? FlattenModules<Mrx>
                    : [Mx]
            : []
        : [] 

export type ToService<P extends Path, S extends ServiceModule> = S extends ServiceModule<infer M>
    ? Service<P, M>
    : never

/**
 * Get the Module types of a Command Module
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

    //// Command Module Implementation ////

    abstract useService<P extends Path, Mx extends ServiceModule<any>>(
        path: P,
        module: Mx
    ): unknown

    abstract useModule<Mx extends Module>(
        module: Mx
    ): unknown

    abstract useModules<Mx extends Modules>(
        ...modules: Mx
    ): unknown

    //// Command Implementation ////

    private _commands: _CommandsOfModules<M> | null = null
    get commands(): ModuleCommands<M> {
        return this._commands ?? this._createCommands() as any
    }

    execute<K extends StringKeys<ModuleCommands<M>>>(
        name: K,
        input: CommandInput<ModuleCommands<M>[K]>
    ): CommandOutput<ModuleCommands<M>[K]> {
        return this.getCommand(name).execute(input as object) as CommandOutput<ModuleCommands<M>[K]>
    }

    //// Convenience Getters ////

    getCommand(name: string): Command<string, object, object>

    getCommand<K extends StringKeys<ModuleCommands<M>>>(name: K): ModuleCommands<M>[K] {
        const command = this.commands[name]
        if (!command)
            throw new Error(`Command ${name} could not be found.`)
    
        return command
    }
    
    get client(): Client | null {
        return this.root.getModule(Client) ?? null
    }
    
    get server(): Server | null {
        return this.root.getModule(Server) ?? null
    }

    //// Module Implementation ////

    override _validateModules(): void {
        this.modules.forEach(m => m._validateModules())
        this._assertNoCommandNameCollisions()
    }

    //// Helper ////

    protected _pushModule(
        ...args: [path: Path, module: Module] | [module: Module] | Modules
    ): Modules {

        const path = pluck(args, $path.is).at(0)
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

    private _assertNoCommandNameCollisions(): void {
        // commands throw on collision during creation anyway
        void this._createCommands()
    }

    private _createCommands(): _CommandsOfModules<M> {

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

        this._commands = commands as _CommandsOfModules<M>
        return this._commands
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
    ): Service<P, [...M, ToService<Px ,S>]> {
        return Service._create(
            this._path,
            this._pushModule(path, module)
        ) as Service<P, [...M, ToService<Px ,S>]> 
    }

    override useModule<Mx extends Module>(
        module: Mx
    ): Service<P, [...M, ...FlattenModules<[Mx]>]> {
        return Service._create(
            this._path,
            this._pushModule(module)
        ) as Service<P, [...M, ...FlattenModules<[Mx]>]> 
    }

    override useModules<Mx extends Modules>(
        ...modules: Mx
    ): Service<P, [...M, ...FlattenModules<Mx>]> {
        return Service._create(
            this._path,
            this._pushModule(...modules)
        ) as Service<P, [...M, ...FlattenModules<Mx>]> 
    }

    //// Module Implementation ////

    protected override get _copyParams(): unknown[] {
        return [this._path, this.modules]
    }

}
