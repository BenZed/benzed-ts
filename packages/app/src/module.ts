import { $$copy } from '@benzed/immutable'
import type { CommandModule } from './service'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Types ////

export type Modules = readonly Module[]

export type ModuleConstructor<M extends Module = Module> =
     (new (...args: any[]) => M) | 
     (abstract new (...args: any[]) => M)

// TODO make this and SettingsModule abstract
export class Module {

    //// Module Interface ////

    get name(): string {
        return this.constructor.name
    }

    log(strings: TemplateStringsArray, ...items: unknown[]): void {
        void strings
        void items
        // TODO implement
    }

    get<M extends Module, R extends boolean = false>(
        type: ModuleConstructor<M>, 
        required: R = false as R
    ): R extends true ? M : M | null {

        const module = this.modules.find(t => t instanceof type) ?? null
        if (!module && required)
            throw new Error(`${this.name} is missing module ${type.name}`)

        return module as M
    }

    has<M extends Module>(type: ModuleConstructor<M>): boolean {
        return !!this.get(type)
    }

    get modules(): Modules {
        return this._parent?.modules ?? []
    }

    private _parent: CommandModule | null = null
    get parent(): CommandModule | null {
        return this._parent
    }

    /**
     * Gets the root module of the app heirarchy.
     * Throws an error on modules that are not parented to anything.
     */
    get root(): CommandModule {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let root: CommandModule | Module = this
        while (root._parent)
            root = root._parent

        if (!(`use` in root))
            throw new Error(`${this.name} is not in a command heirarchy.`)
    
        return root
    }

    /**
     * Copies a module, sets the parent of that module to the given parent
     * @internal
     */
    _copyWithParent(parent: CommandModule): this {
        const _this = this[$$copy]()
        _this._parent = parent

        return _this
    }

    //// Immutable Implementation ////
    
    [$$copy](): this {
        const ThisModule = this.constructor as new (...params: unknown[]) => this
        return new ThisModule(...this._copyParams)
    }

    protected get _copyParams(): unknown[] {
        return []
    }

    //// Lifecycle Hooks ////

    private _active = false
    /**
     * True if this module has been started, false otherwise.
     */
    get active() : boolean {
        return this._active
    }

    start(): void | Promise<void> {
        if (this.active) {
            throw new Error(
                `${this.name} has already been started`
            )
        }

        this._active = true
    }

    stop(): void | Promise<void> {
        if (!this.active) {
            throw new Error(
                `${this.name} has not been started`
            )
        }
        this._active = false
    }

    //// Validation ////

    /**
     * // TODO make abstract
     * Should only be called by parent module
     * @internal
     */
    _validateModules(): void { /**/ }

    /**
     * Must be the only module of it's type in a parent.
     */
    protected _assertSingle(): void { 
        const clone = this.get(this.constructor as ModuleConstructor)
        if (clone && clone !== this)
            throw new Error(`${this.name} may only be used once`)
    }

    /**
     * Module must be a root-level module of an app, not nested.
     */
    protected _assertRoot(): void {
        if (this._parent?.parent)
            throw new Error(`${this.name} must be a root level module.`)
    }
    
    /**
     * Module must have access to the given modules
     */
    protected _assertRequired(...types: readonly ModuleConstructor[]): void {
        const missing = types.filter(t => !this.has(t))
        if (missing.length > 0) {
            throw new Error(
                `${this.name} is missing required components: ${missing.map(t => t.name)}`
            )
        }
    }

    /**
     * Module must not be on the same service/app as the given modules
     */
    protected _assertConflicting(...types: readonly ModuleConstructor[]): void { 
        const found = types.filter(t => this.has(t))
        if (found.length > 0) {
            throw new Error(
                `${this.name} may not be used with conflicting components: ${found.map(t => t.name)}`
            )
        }
    }
}

//// Module With Settings ////

/**
 * A module with settings
 */
export class SettingsModule<S extends object> extends Module {

    get settings(): S {
        return this._settings
    }
    
    constructor( 
        private readonly _settings: S
    ) { 
        super()
    }

    protected override get _copyParams(): unknown[] {
        return [this._settings]
    }

}
