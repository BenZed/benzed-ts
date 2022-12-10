import { wrap } from '@benzed/array'
import { $$copy, unique } from '@benzed/immutable'
import { callable, nil, toVoid, Logger, Transform } from '@benzed/util'

import type { ServiceModule } from './service'
import type { Logger as LoggerModule } from './modules'

import { $path, Path } from './util/types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Constants ////

/**
 * Allow the use of the .log api without breaking any modules in
 * the event that logging is not enabled.
 */
const DUMMY_LOGGER = Logger.create({
    onLog: toVoid
})

//// Types ////

export type Modules = readonly Module[]

export type FindModuleGuard<M extends Module> = (input: Module) => input is M 

export type ModuleConstructor<M extends Module = Module> =
     (new (...args: any[]) => M) | 
     (abstract new (...args: any[]) => M) | 
     { name: string, prototype: M }

export type FindModuleScope = 
    'siblings' | 
    'parents' | 
    'children' | 
    'root' |
    readonly (
        'siblings' | 
        'parents' | 
        'children' | 
        'root'
    )[]

// TODO make this and SettingsModule abstract
export class Module {

    //// Module Interface ////

    get name(): string {
        return this.constructor.name
    }

    private get _icon(): string {

        type Iconable = { icon?: string }

        return (this as Iconable)?.icon ?? 
            (this.constructor as Iconable)?.icon ?? ''
    }

    private _log: Logger | nil = nil
    get log(): Logger {
        
        if (!this._log) {
        
            const logger = this.findModule(
                (m: Module): m is LoggerModule => m.name === 'Logger', 
                false, 
                'parents'
            )

            this._log = logger 
                ? Logger.create({
                    ...logger.settings,
                    header: this._icon,
                    onLog: (...args) => {
                        logger._pushLog(...args)
                        logger.settings.onLog(...args)
                    }
                })
                : DUMMY_LOGGER
        }

        return this._log
    }

    // /**
    //  * Get a module corresponding with a provided instance
    //  */
    // getModule<M extends Module>(module: M): M{

    // }

    findModule<M extends Module, R extends boolean = false>(
        type: FindModuleGuard<M>, 
        required?: R,
        scope?: FindModuleScope
    ): R extends true ? M : M | nil

    findModule<M extends Module, R extends boolean = false>(
        type: ModuleConstructor<M>, 
        required?: R,
        scope?: FindModuleScope
    ): R extends true ? M : M | nil 
    
    findModule(
        type: FindModuleGuard<Module> | ModuleConstructor<Module>,
        required?: boolean,
        scope?: FindModuleScope
    ): Module | nil {
        return this
            .findModules(type, required, scope)
            .at(0) 
    }

    findModules<M extends Module, R extends boolean = false>(
        type: ModuleConstructor<M>, 
        required?: R,
        scope?: FindModuleScope
    ): M[] {

        const modules: M[] = []

        const guard: FindModuleGuard<M> = 'prototype' in type 
            ? (i): i is M => i instanceof (type as any) 
            : type
        
        this.eachModule(m => {
            for (const m1 of m.modules) {
                if (guard(m1) && !modules.includes(m1)) 
                    modules.push(m1)
            }
        }, scope)

        if (modules.length === 0 && required)
            throw new Error(`${this.name} is missing module ${type.name} ${scope ? `in scope ${scope}` : ''}`.trim())

        return modules
    }

    eachModule<F extends (input: Module) => unknown>(f: F, scope: FindModuleScope = 'siblings'): ReturnType<F>[] {
        const scopes = wrap(scope).filter(unique) as unknown as Exclude<FindModuleScope, string>

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

                default: {
                    const badScope: never = scope
                    throw new Error(`${badScope} is an invalid scope.`)
                }
            }
        }
    }

    hasModule<M extends Module>(type: ModuleConstructor<M>): boolean {
        return !!this.findModule(type)
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
                path.push(m.path as string)
        })

        if ('path' in this)
            path.push(this.path as string)

        return $path.validate(path.reverse().join(''))
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
        this._assertStopped()
        this._active = true
    }

    stop(): void | Promise<void> {
        this._assertStarted()
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
    protected _assertSingle(scope?: FindModuleScope): void { 
        const clone = this.findModule(this.constructor as ModuleConstructor, false, scope)
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
    protected _assertRequired(type: ModuleConstructor<Module> | FindModuleGuard<Module>, scope?: FindModuleScope): void {
        if (!this.findModule(type, false, scope)) {
            throw new Error(
                `${this.name} is missing required module ${type.name} in scope ${scope}`
            )
        }
    }

    /**
     * Module must not be on the same service/app as the given modules
     */
    protected _assertConflicting(type: ModuleConstructor<Module> | FindModuleGuard<Module>, scope?: FindModuleScope): void { 
        if (this.findModule(type, false, scope)) {
            throw new Error(
                `${this.name} may not be used with conflicting module ${type.name} in scope ${scope}`
            )
        }
    }

    protected _assertStarted(): void {
        if (!this.active) {
            throw new Error(
                `${this.name} has not been started`
            )
        }
    }

    protected _assertStopped(): void {
        if (this.active) {
            throw new Error(
                `${this.name} has already been started`
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

//// Executable Module ////

export interface ExecutableModule<I extends object, O extends object> extends Module, Transform<I,O> {
    readonly execute: Transform<I,O>
}

//

interface ExecutableModuleConstructor {
    new<I extends object, O extends object>(
        
        execute: Transform<I, O> | 
        ((this: ExecutableModule<I,O>, input: I) => O)

    ): ExecutableModule<I, O>
}

//// Executable Module ////

export const ExecutableModule: ExecutableModuleConstructor = callable(
    function (i: object): object {
        return this.execute(i)
    },
    class extends Module {

        constructor(
            readonly execute: Transform<object, object>,
        ) {
            super()
        }

        protected override get _copyParams(): unknown[] {
            return [this.execute]
        }
    }
)