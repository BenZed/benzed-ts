import is from '@benzed/is'
import { pluck } from '@benzed/array'
import { $$copy } from '@benzed/immutable'
import { createLogger, Logger, toVoid } from '@benzed/util'

import { ENV, TEST_LOGS_ENABLED } from './constants'
import { command, CommandsOf } from './command'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Symbols ***/

export const $$parentTo = Symbol(`set-parent-from-inside-module`)

/*** Types ***/

export type Modules = readonly Module[]

export type ModuleConstructor<M extends Module = Module> =
     (new (...args: any[]) => M) | 
     (abstract new (...args: any[]) => M)

export class Module {

    constructor(
        protected _icon?: string
    ) { 

        this.log = createLogger({
            header: _icon,
            onLog: ENV === `test` && !TEST_LOGS_ENABLED
                ? toVoid 
                : console.log.bind(console)
        })

    }

    log!: Logger

    // Component API

    get<M extends Module, R extends boolean = false>(
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

    private _parent: ServiceModule<any> | null = null 
    get parent(): ServiceModule<any> | null {
        return this._parent
    }

    get root(): ServiceModule<any> | null {

        let { parent: root } = this
        while (root?.parent)
            root = root.parent

        return root
    }

    [$$copy](): this {
        const clone = new (
            this.constructor as new (icon?: string) => this
        )(this._icon)

        return clone
    }

    /**
     * Creates an immutable instanceof this module with a set parent
     */
    [$$parentTo](parent: ServiceModule<any>, ...args: unknown[]): this {
        void args 

        const clone = this[$$copy]()
        
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

/*** Service ***/

export interface ModuleSettings {
    logIcon?: string
}

export class ModuleWithSettings<S extends object = ModuleSettings> extends Module {

    get settings(): S {
        return this._settings
    }
    
    constructor( 
        private readonly _settings: S
    ) { 
        super(`logIcon` in _settings ? (_settings as ModuleSettings).logIcon : ``)
    }

    [$$copy](): this {
        const clone = new (
            this.constructor as new (settings: S) => this
        )(this.settings)

        return clone
    }

}

export type ModulesOf<A extends ServiceModule> = A extends ServiceModule<infer M> ? M : []

export abstract class ServiceModule<M extends Modules = any> extends Module {

    private readonly _modules: M
    override get modules(): M {
        return this._modules
    }

    constructor(
        modules: M,
        icon?: string
    ) {
        super(icon)

        for (const module of modules)
            module[$$parentTo](this)

        this._modules = modules
        this.validateModules()
    }

    [$$copy](): this {
        const clone = new (
            this.constructor as new (modules: M, icon?: string) => this
        )(this.modules, this._icon)

        return clone
    }

    // Lifecycle Methods

    override async start(): Promise<void> {
        if (this.modules.length === 0)
            throw new Error(`${this.constructor.name} cannot start without any modules.`)

        await super.start()
        await Promise.all(this.modules.map(m => m.start()))
    }

    override async stop(): Promise<void> {
        if (this.modules.length === 0)
            throw new Error(`${this.constructor.name} cannot stop without any modules.`)
        
        await super.stop()
        await Promise.all(this.modules.map(m => m.stop()))
    }

    // Service Implementation

    abstract use<Mx extends ServiceModule<any>>(
        path: string,
        module: Mx
    ): unknown

    abstract use<Mx extends Module>(
        module: Mx
    ): unknown

    getCommands(): CommandsOf<M[number]> {
        
        let commands = {}

        for (const module of this.modules) {

            commands = {
                ...command.of(module)
            }

        }

        return commands as CommandsOf<M[number]>
    }

    // Module Implementation

    override validateModules(): void {
        this.modules.forEach(m => m.validateModules())
    }

    // Helper 

    protected _pushModule<Mx extends Module>(
        ...args: Mx extends Service<any> 
            ? [path: string, module: Mx] | [module: Mx] 
            : [module: Mx]
    ): [...M, Mx] {

        const path = pluck(args, is.string).at(0)
        let module = pluck(args, m => is(m, Module)).at(0) as Mx | undefined
        if (!module)
            throw new Error(`${Module.name} not provided.`)

        if (path && module instanceof Service<any>)
            module = module[$$parentTo](this, path)

        return [ ...this.modules, module ] as [ ...M, Mx ]
    }

}

/**
 * Generic service with no settings of it's own.
 * Extend ServiceModule to create configurable services.
 */
export class Service<P extends `/${string}`, M extends Modules = any> extends ServiceModule<M> {

    static create(): Service<'/', []> {
        return new Service(`/`, [])
    }

    get path(): P {
        return this._path
    }
    
    private constructor(
        private _path: P,
        modules: M
    ) {
        super(modules, `💻`)
    }

    override use<Px extends `/${string}`, S extends Service<any>>(
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

    [$$copy](): this {
        const clone = new (
            this.constructor as new (path: P, modules: M, icon?: string) => this
        )(this._path, this.modules, this._icon)

        return clone
    }

    [$$parentTo]<Px extends `/${string}`>(
        parent: ServiceModule<any>,
        path: Px
    ): this {

        const clone = this[$$copy]()
        clone._path = path as unknown as P

        return super[$$parentTo](parent)
    }

}