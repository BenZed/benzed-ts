import { pluck } from '@benzed/array'
import { Empty } from '@benzed/util'
import is from '@benzed/is'

import { Command } from "./command"

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Symbols ***/

export const $$parentTo = Symbol(`set-parent`)

/*** Types ***/

export type Modules = readonly Module<any>[]

export type ModuleConstructor<M extends Module<any> = Module<any>> =
     (new (...args: any[]) => M) | 
     (abstract new (...args: any[]) => M)

export type ModuleSettings<M extends Module<any>> = M extends Module<infer S> ? S : Empty

export class Module<S extends object = Empty> {

    get settings(): S {
        return this._settings
    }
    
    constructor( 
        private readonly _settings: S
    ) { }

    // Component API

    get<M extends Module<any>, R extends boolean = false>(
        type: ModuleConstructor<M>, 
        required: R = false as R
    ): R extends true ? M : M | null {

        const module = this.modules.find(t => t instanceof type) ?? null
        if (!module && required)
            throw new Error(`${this.constructor.name} is missing module ${type.name}`)

        return module as M
    }

    has<M extends Module>(type: ModuleConstructor<M>): boolean {
        return !!this.get(type)
    }

    get modules(): Modules {
        return this.parent?.modules ?? []
    }

    private _parent: ServiceModule<any,any> | null = null 
    get parent(): ServiceModule<any,any> | null{
        return this._parent
    }
    
    /**
     * Creates an immutable instanceof this module with a set parent
     */
    [$$parentTo](parent: ServiceModule<any,any>): this {
        const clone = new (
            this.constructor as new (settings: object) => this
        )(this.settings)

        clone._parent = parent
        clone.validateModules()

        return clone
    }

    // Lifecycle Hooks 

    start(): void | Promise<void> { /**/ }

    stop(): void | Promise<void> { /**/ }

    // Validation

    validateModules(): void { /**/ }

    /**
     * Must be the only module of it's type in a parent.
     */
    protected _assertSingle(): void { 
        const clone = this.get(this.constructor as ModuleConstructor)
        if (clone && clone !== this)
            throw new Error(`${this.constructor.name} may only be used once`)
    }

    /**
     * Module must be a root-level module of an app, not nested.
     */
    protected _assertRoot(): void {
        if (this.parent?.parent)
            throw new Error(`${this.constructor.name} must be a root level module.`)
    }
    
    /**
     * Module must have access to the given modules
     */
    protected _assertRequired(...types: readonly ModuleConstructor[]): void {
        const missing = types.filter(t => !this.has(t))
        if (missing.length > 0) {
            throw new Error(
                `${this.constructor.name} is missing required components: ${missing.map(t => t.name)}`
            )
        }
    }

    /**
     * Module cannot be 
     */
    protected _assertConflicting(...types: readonly ModuleConstructor[]): void { 
        const found = types.filter(t => this.has(t))
        if (found.length > 0) {
            throw new Error(
                `${this.constructor.name} may not be used with conflicting components: ${found.map(t => t.name)}`
            )
        }
    }
}

/*** Command Modules ***/

export type CommandsOf<M extends CommandModule> = M extends CommandModule<infer C, any> ? C : Empty

export abstract class CommandModule<C extends Command = any, S extends object = any> extends Module<S> {

    abstract canExecute(command: Command): command is C

    execute(command: C): any {
        if (!this.canExecute(command))
            throw new Error(`${this.constructor.name} cannot execute command: ${JSON.stringify(command)}`)

        return this._execute(command)
    }

    protected abstract _execute(command: C): object | Promise<object>

}

/*** Service ***/

export type ModulesOf<A extends ServiceModule> = A extends ServiceModule<infer M> ? M : []

export type ServiceCommands<M extends Modules | ServiceModule<any>> = _ServiceCommandsArray<M>[number]

type _ServiceCommandsArray<M extends Modules | ServiceModule<any>> = 
    M extends ServiceModule<infer Mx>
        ? _ServiceCommandsArray<Mx>
        : { [K in keyof M]: M[K] extends CommandModule<infer C, any> 
            ? C 
            : never }

export abstract class ServiceModule<M extends Modules = any, S extends object = Empty> extends CommandModule<ServiceCommands<M>, S> {

    private readonly _modules: M
    override get modules(): M {
        return this._modules
    }

    constructor(
        modules: M, 
        settings: S
    ) {
        super(settings)
        this._modules = modules.map(m => m[$$parentTo](this)) as unknown as M
        this.validateModules()
    }
    
    // Convenience getters
    get commandModules(): CommandModule<ServiceCommands<M>>[] {
        return this
            .modules
            .filter((m): m is CommandModule<ServiceCommands<M>> => `execute` in m)
    }

    // Lifecycle Methods

    override async start(): Promise<void> {
        if (this.modules.length === 0)
            throw new Error(`${this.constructor.name} cannot start without any modules.`)

        await Promise.all(this.modules.map(m => m.start()))
    }

    override async stop(): Promise<void> {
        if (this.modules.length === 0)
            throw new Error(`${this.constructor.name} cannot stop without any modules.`)
        
        await Promise.all(this.modules.map(m => m.stop()))
    }

    // Service Implementation

    private _path = ``
    get path(): string {
        return this._path
    }

    override [$$parentTo](parent: ServiceModule<any, any>, path: string = this._path): this {
        const clone = new (
            this.constructor as new (modules: M, settings: S) => this
        )(this.modules, this.settings)

        clone[`_parent`] = parent
        clone._path = path
        clone.validateModules()
        
        return clone
    }

    abstract use<Mx extends Module<any>>(
        ...args: Mx extends ServiceModule<any,any> 
            ? [path: string, module: Mx] | [module: Mx] 
            : [module: Mx]
    ): unknown

    // Command Implementation 
    
    _execute(command: Command): any {
        const module = this
            .commandModules
            .find(m => m.canExecute(command)) as CommandModule
    
        return module.execute(command)
    }
    
    canExecute(command: Command): command is ServiceCommands<M> {
        return this
            .commandModules
            .some(m => m.canExecute(command))
    }

    // Module Implementation

    override validateModules(): void {
        this.modules.forEach(m => m.validateModules())
    }

    // Helper 

    protected _pushModule<Mx extends Module<any>>(
        ...args: Mx extends ServiceModule<any,any> 
            ? [path: string, module: Mx] | [module: Mx] 
            : [module: Mx]
    ): [...M, Mx] {

        const path = pluck(args, is.string).at(0) 
        let module = pluck(args, m => is(m, Module)).at(0) as Mx | undefined
        if (!module)
            throw new Error(`${Module.name} not provided.`)

        if (path && module instanceof ServiceModule)
            module = module[$$parentTo](this, path)

        return [ ...this.modules, module ] as [ ...M, Mx ]
    }

}

/**
 * Generic service with no settings of it's own.
 * Extend ServiceModule to create configurable services.
 */
export class Service<M extends Modules = any> extends ServiceModule<M> {

    static create(): Service<[]> {
        return new Service([])
    }

    use<Mx extends Module<any>>(
        ...args: Mx extends ServiceModule<any, any> 
            ? [path: string, module: Mx] | [module: Mx] 
            : [module: Mx]
    ): Service<[...M, Mx]> {
        return new Service(
            this._pushModule(...args) 
        )
    }

    private constructor(
        modules: M
    ) {
        super(modules, {})
    }
}