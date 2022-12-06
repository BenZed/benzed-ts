import { wrap } from '@benzed/array'
import { $$copy, unique } from '@benzed/immutable'
import { nil } from '@benzed/util/lib'

import type { Service, ServiceModule } from './service'
import { Path } from './util/types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Types ////

type GetPredicate = (input: Module) => boolean

type GetGuard<M extends Module> = (input: Module) => input is M 

//// Types ////

export type Modules = readonly Module[]

export type ModuleConstructor<M extends Module = Module> =
     (new (...args: any[]) => M) | 
     (abstract new (...args: any[]) => M) | 
     { name: string, prototype: M }

export type GetModuleScope = 
    'siblings' | 'parents' | 'children' | 'root' |
    readonly ('siblings' | 'parents' | 'children' | 'root')[]

export type GetModuleInput<M extends Module> = ModuleConstructor<M> | GetPredicate | GetGuard<M>

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
        type: GetModuleInput<M>, 
        required?: R,
        scope?: GetModuleScope
    ): R extends true ? M : M | nil {
        return this
            .getModules(type, required, scope)
            .at(0) as R extends true ? M : M | nil
    }

    getModules<M extends Module, R extends boolean = false>(
        type: GetModuleInput<M>, 
        required?: R,
        scope?: GetModuleScope
    ): M[] {

        const modules: M[] = []

        const guard: GetGuard<M> = 'prototype' in type 
            ? (i): i is M => i instanceof (type as any) 
            : type
        
        this.forEachModule(m => {
            for (const m1 of m.modules) {
                if (guard(m1) && !modules.includes(m1)) 
                    modules.push(m1)
            }
        }, scope)

        if (modules.length === 0 && required)
            throw new Error(`${this.name} is missing module ${type.name} ${scope ? `in scope ${scope}` : ''}`.trim())

        return modules
    }

    forEachModule(f: (input: Module) => void, scope: GetModuleScope = 'siblings'): void {
        const scopes = unique(wrap(scope)) as unknown as Exclude<GetModuleScope, string>

        for (const scope of scopes) {
            switch (scope) {
                case 'siblings': {
                    this.modules.forEach(f)
                    break
                }
                case 'parents': {
                    this._forEachAscendent(f)
                    break

                }
                case 'children': {
                    this._forEachDesendent(f)
                    break
                }
                case 'root': {
                    this.root.modules.forEach(f)
                    break
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
     * Path from the root of this app.
     */
    get pathFromRoot(): Path {

        const path: string[] = []

        this._forEachAscendent(m => {
            if ('path' in m)
                path.push((m as Service<any,any>).path)
        })

        if ('path' in this)
            path.push((this as Service<any,any>).path)

        return path.reverse().join('') as Path
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
    protected _assertSingle(scope?: GetModuleScope): void { 
        const clone = this.getModule(this.constructor as ModuleConstructor, false, scope)
        if (clone && clone !== this)
            throw new Error(`${this.name} may only be used once in scope ${scope}`)
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
    protected _assertRequired(type: ModuleConstructor<Module> | GetPredicate | GetGuard<Module>, scope?: GetModuleScope): void {
        if (!this.getModule(type, false, scope)) {
            throw new Error(
                `${this.name} is missing required module ${type.name} in scope ${scope}`
            )
        }
    }

    /**
     * Module must not be on the same service/app as the given modules
     */
    protected _assertConflicting(type: ModuleConstructor<Module> | GetPredicate | GetGuard<Module>, scope?: GetModuleScope): void { 
        if (this.getModule(type, false, scope)) {
            throw new Error(
                `${this.name} may not be used with conflicting module ${type.name} in scope ${scope}`
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
