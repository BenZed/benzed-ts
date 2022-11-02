import is from '@benzed/is'
import $ from '@benzed/schema'
import { pluck } from '@benzed/array'
import { capitalize } from '@benzed/string'

import { 
    command,
    Command,  
    CommandsOf, 
} from './_old-command'

import { Module, Modules } from './module'
import { Client, Server } from './modules'

import { CamelCombine, Path } from './types'
import { Compile } from '@benzed/util/lib'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper ////

const isModule = $(Module).is

const isPath = (input: unknown): input is Path => is.string(input) && input.startsWith('/')

//// Helper Types ////

type _Unslash<S extends string> = S extends `/${infer Sx}` ? Sx : S

//// Commands Type ////

type _CommandsOfModule<M extends Module, P extends string> = 
    M extends Service<infer Px, infer Mx> 
        ? _CommandsOfModules<Mx, CamelCombine<P, _Unslash<Px>>>
        : CommandsOf<M, P> 

type _CommandsOfModules<M extends Modules, P extends string = ''> = M extends [infer Mx, ...infer Mr] 
    ? Mx extends Module 
        ? Mr extends Modules 
            ? _CommandsOfModule<Mx, P> & _CommandsOfModules<Mr, P>
            : _CommandsOfModule<Mx, P>
        : {}
    : {}

type ModuleCommands<M extends Modules | Module> = 
    Compile<
    M extends CommandModule<infer Mx> 
        ? _CommandsOfModules<Mx>
        : M extends Modules 
            ? _CommandsOfModules<M>
            : CommandsOf<M>, 

    Command, 
    false
    >

//// Command Module ////

/**
 * Get the Module types of a Command Module
 */
export type ModulesOf<S extends CommandModule<any>> = S extends CommandModule<infer M> ? M : never

/**
 * Contains other modules, provides an interface for grouping and executing their commands.
 */
export abstract class CommandModule<M extends Modules = any> extends Module {

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

    abstract useModule<Mx extends CommandModule<any>>(
        path: Path,
        module: Mx
    ): unknown

    abstract useModule<Mx extends Module>(
        module: Mx
    ): unknown

    //// Command Implementation ////

    private _commands: _CommandsOfModules<M> | null = null
    get commands(): ModuleCommands<M> {
        return this._commands ?? this._createCommands() as any
    }

    //// Convenience Getters ////

    getCommand(name: string): Command {
        const commands = this.root.commands as { [key: string]: Command | undefined } 
        const command = commands[name]
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
        ...args: [path: Path, module: Module] | [module: Module] 
    ): Modules {

        const path = pluck(args, isPath).at(0)
        let module = pluck(args, isModule).at(0)
        if (!module)
            throw new Error(`${Module.name} not provided.`)

        if (path && module instanceof CommandModule<any>)
            module = Service._create(path, module._modules)

        else if (path)
            throw new Error(`${module.name} is not a service, and cannot be used at path: ${path}`)

        return [ ...this.modules, module ]
    }

    private _assertNoCommandNameCollisions(): void {
        // commands throw on collision during creation anyway
        void this._createCommands()
    }

    private _createCommands(): _CommandsOfModules<M> {
        const commands: { [key: string]: Command } = {}

        for (const module of this.modules) {

            const moduleCommands = module instanceof CommandModule 
                ? module.commands
                : command.of(module)

            for (const key in moduleCommands) {

                const name: string = module instanceof Service
                    ? `${module.path.replaceAll('/', '')}${capitalize(key)}`
                    : key

                if (name in commands)
                    throw new Error(`Command name collision: "${name}" is used multiple times`)
                
                commands[name] = moduleCommands[key as keyof typeof moduleCommands]
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
export class Service<P extends Path, M extends Modules = any> extends CommandModule<M> {

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

    override useModule<Px extends Path, S extends CommandModule<any>>(
        path: Px,
        module: S
    ): Service<P, [...M, S extends CommandModule<infer Mx> ? Service<Px, Mx> : never]>

    override useModule<Mx extends Module>(
        module: Mx
    ): Service<P, [...M, Mx]>

    override useModule(
        ...args: [path: Path, module: Module] | [module: Module] 
    ): Service<Path, Modules> {
        return Service._create(
            this._path,
            this._pushModule(...args)
        )
    }

    //// Module Implementation ////

    protected override get _copyParams(): unknown[] {
        return [this._path, this.modules]
    }

}