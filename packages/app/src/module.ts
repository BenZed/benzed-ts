import { $$copy, unique } from '@benzed/immutable'
import { wrap } from '@benzed/array'

import type { ServiceModule } from './service'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Types ////

export type Modules = readonly Module[]

export type ModuleConstructor<M extends Module = Module> =
     (new (...args: any[]) => M) | 
     (abstract new (...args: any[]) => M)

type GetScope = 'siblings' | 'parents' | 'children' | readonly ('siblings' | 'parents' | 'children')[]

type GetPredicate = (input: Module) => boolean

type GetGuard<M extends Module> = (input: Module) => input is M 

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

    getModule<M extends Module, R extends boolean = false>(
        type: ModuleConstructor<M> | GetPredicate | GetGuard<M>, 
        required?: R,
        scope?: GetScope
    ): R extends true ? M : M | null {
        return this
            .getModules(type, required, scope)
            .at(0) ?? null as R extends true ? M : M | null
    }

    getModules<M extends Module, R extends boolean = false>(
        type: ModuleConstructor<M> | GetPredicate | GetGuard<M>, 
        required?: R,
        scope?: GetScope
    ): M[] {

        const modules: M[] = []

        const guard: GetGuard<M> = 'prototype' in type 
            ? (i): i is M => i instanceof type 
            : type
        
        this.forEachModule(m => {
            for (const m1 of m.modules) {
                if (guard(m1) && !modules.includes(m1)) 
                    modules.push(m1)
            }
        }, scope)

        if (modules.length === 0 && required)
            throw new Error(`${this.name} is missing module ${type.name}`)

        return modules
    }

    forEachModule(f: (input: Module) => void, scope: GetScope = 'siblings'): void {
        const scopes = unique(wrap(scope)) as unknown as Exclude<GetScope, string>

        for (const scope of scopes) {
            switch (scope) {
                case 'siblings': {
                    this.modules.forEach(f)
                }
                case 'parents': {
                    this._forEachAscendent(f)
                }
                case 'children': {
                    this._forEachDesendent(f)
                }
            }
        }
    }

    hasModule<M extends Module>(type: ModuleConstructor<M>): boolean {
        return !!this.getModule(type)
    }

    get modules(): Modules {
        return this._parent?.modules ?? []
    }

    private _parent: ServiceModule | null = null
    get parent(): ServiceModule | null {
        return this._parent
    }

    /**
     * Gets the root module of the app heirarchy.
     * Throws an error on modules that are not parented to anything.
     */
    get root(): ServiceModule {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let root: ServiceModule | Module = this
        while (root._parent)
            root = root._parent

        const useModule: keyof ServiceModule = 'useModule'
        if (!(useModule in root))
            throw new Error(`${this.name} is not in a command heirarchy.`)
    
        return root
    }

    /**
     * Copies a module, sets the parent of that module to the given parent
     * @internal
     */
    _copyWithParent(parent: ServiceModule): this {
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

    /**
     * True if this module has been started, false otherwise.
     */
    get active() : boolean {
        return this._active
    }
    private _active = false

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
    protected _assertSingle(scope?: GetScope): void { 
        const clone = this.getModule(this.constructor as ModuleConstructor, false, scope)
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
        const missing = types.filter(t => !this.hasModule(t))
        if (missing.length > 0) {
            throw new Error(
                `${this.name} is missing required module${missing.length > 1 ? 's' : '' }: ${missing.map(t => t.name)}`
            )
        }
    }

    /**
     * Root module must have components
     */
    protected _assertRootRequired(...types: readonly ModuleConstructor[]): void {
        try {
            this.root._assertRequired(...types)
        } catch (e: any) {
            if (e.message.includes('missing required')) {
                throw new Error(
                    `${this.name} requires ${e.message.replace('is missing required', 'to have')}`
                )
            }

        }
    }

    /**
     * Module must not be on the same service/app as the given modules
     */
    protected _assertConflicting(...types: readonly ModuleConstructor[]): void { 
        const found = types.filter(t => this.hasModule(t))
        if (found.length > 0) {
            throw new Error(
                `${this.name} may not be used with conflicting components: ${found.map(t => t.name)}`
            )
        }
    }

    // Helper 

    private _forEachAscendent(f: (input: Module) => void): void {
        let ref = this._parent

        while (ref) {
            f(ref)
            ref = ref.parent
        }
    }

    private _forEachDesendent(f: (input: Module) => void): void {
        for (const m of this.modules) {
            if (m.modules !== this.modules) {
                f(m)
                m._forEachDesendent(f)
            }
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
