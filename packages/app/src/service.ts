import is from '@benzed/is'
import { pluck } from '@benzed/array'
import { capitalize } from '@benzed/string'
import { StringKeys } from '@benzed/util'

import { 
    command,
    Command,  
    CommandInput, 
    CommandOutput,
    CommandsOf, 
} from './command'

import { Module, Modules } from './module'
import { CamelCombine, Path } from './types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

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

//// Execute Types ////

type _ExecutableCommand<M extends Modules, N extends keyof _CommandsOfModules<M>> = _CommandsOfModules<M>[N] extends Command<any,any,any> 
    ? _CommandsOfModules<M>[N]
    : never 

export type ExecuteInput<M extends Modules, N extends keyof _CommandsOfModules<M>> = CommandInput<_ExecutableCommand<M,N>>

export type ExecuteOutput<M extends Modules, N extends keyof _CommandsOfModules<M>> = CommandOutput<_ExecutableCommand<M,N>>

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

    //// Service Implementation ////

    abstract use<Mx extends CommandModule<any>>(
        path: string,
        module: Mx
    ): unknown

    abstract use<Mx extends Module>(
        module: Mx
    ): unknown

    //// Command Implementation ////

    private _commands: _CommandsOfModules<M> | null = null
    get commands(): _CommandsOfModules<M> {
        return this._commands ?? this._createCommands()
    }

    execute<N extends StringKeys<_CommandsOfModules<M>>>(
        name: N,
        data: ExecuteInput<M, N>
    ): ExecuteOutput<M, N> {

        const _command = this.commands[name]
        if (!command.is(_command))
            throw new Error(`${name} is not a command`)

        return _command(data)
    }

    //// Module Implementation ////

    override _validateModules(): void {
        this.modules.forEach(m => m._validateModules())
        this._assertNoCommandNameCollisions()
    }

    //// Helper ////

    protected _pushModule<Mx extends Module>(
        ...args: Mx extends Service<any> 
            ? [path: string, module: Mx] | [module: Mx] 
            : [module: Mx]
    ): [...M, Mx] {

        const path = pluck(args, is.string).at(0) as Path
        let module = pluck(args, m => is(m, Module)).at(0) as Mx | undefined
        if (!module)
            throw new Error(`${Module.name} not provided.`)

        if (path && module instanceof Service<any>)
            module = module._copyWithPath(path) as unknown as Mx

        else if (path)
            throw new Error(`${module.name} is not a service, and cannot be used at path: ${path}`)

        return [ ...this.modules, module ] as [ ...M, Mx ]
    }

    private _assertNoCommandNameCollisions(): void {
        void this._createCommands()
    }

    private _createCommands(): _CommandsOfModules<M> {
        const commands: { [key: string]: Command } = {}

        for (const module of this.modules) {

            const isService = module instanceof Service

            const moduleCommands = isService 
                ? module.commands
                : command.of(module)

            for (const key in moduleCommands) {

                const name: string = isService 
                    ? `${module.path.replaceAll(`/`, ``)}${capitalize(key)}`
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
    
    static create(): Service<'/', []> {
        return new Service(`/`, [])
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

    override use<Px extends Path, S extends Service<any>>(
        path: Px,
        module: S
    ): Service<P, [...M, S extends Service<any, infer Mx> ? Service<Px, Mx> : never]>

    override use<Mx extends Module>(
        module: Mx
    ): Service<P, [...M, Mx]>

    override use<Mx extends Module>(
        ...args: Mx extends Service<any> 
            ? [path: string, module: Mx] | [module: Mx] 
            : [module: Mx]
    ): Service<P, [...M, Mx]> {
        return new Service(
            this.path,
            this._pushModule(...args)
        )
    }

    //// Module Implementation ////

    protected override get _copyParams(): unknown[] {
        return [this._path, this.modules]
    }

    //// Helper ////
    
    /**
     * @internal
     */
    _copyWithPath<Px extends Path>(path: Px): Service<Px, M> {
        return new Service(
            path,
            this.modules
        )
    }

}