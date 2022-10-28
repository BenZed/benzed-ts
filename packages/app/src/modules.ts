
import { Empty } from '@benzed/util'

import { Command } from "./command"

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

export type Modules = readonly Module<any>[]

export type ModuleConstructor<M extends Module<any> = Module<any>> =
     (new (...args: any[]) => M) | 
     (abstract new (...args: any[]) => M)

export type SettingsOf<M extends Module<any>> = M extends Module<infer S> ? S : Empty

export abstract class Module<S extends object = Empty> {

    get settings(): S {
        return this._settings
    }
    
    constructor( 
        private readonly _settings: S
    ) { }

    private readonly _parent: ServiceModule<any,any,any> | null = null 
    get parent(): ServiceModule<any,any,any> | null{
        return this._parent
    }
    
    parentTo(parent: ServiceModule<any,any,any>): this {
        const clone = new (this.constructor as any)(this.settings)
        clone._parent = parent

        return clone
    }

    // Component API

    get<M extends Module<any>, R extends boolean = false>(
        type: ModuleConstructor<M>, 
        required: R = false as R
    ): R extends true ? M : M | null {

        const module = this.parent?.get(type) ?? null
        if (!module && required)
            throw new Error(`${this.constructor.name} is missing module ${type.name}`)

        return module as M
    }

    has<M extends Module>(type: ModuleConstructor<M>): boolean {
        return !!this.get(type)
    }

    // Lifecycle Hooks 

    start(): void | Promise<void> { /**/ }

    stop(): void | Promise<void> { /**/ }

    // Validation

    validateModules(): void { /**/ }

    protected _assertSingle(): void { 
        const clone = this.get(this.constructor as ModuleConstructor)
        if (clone && clone !== this)
            throw new Error(`${this.constructor.name} may only be used once`)
    }
    
    protected _assertRequired(...types: readonly ModuleConstructor[]): void {
        const missing = types.filter(t => !this.has(t))
        if (missing.length > 0) {
            throw new Error(
                `${this.constructor.name} is missing required components: ${missing.map(t => t.name)}`
            )
        }
    }

    protected _assertConflicting(...types: readonly ModuleConstructor[]): void { 
        const found = types.filter(t => this.has(t))
        if (found.length > 0) {
            throw new Error(
                `${this.constructor.name} may not be used with conflicting components: ${found.map(t => t.name)}`
            )
        }
    }
}

export abstract class CommandModule<C extends Command = any, S extends object = any> extends Module<S> {

    abstract canExecute(command: Command): command is C

    execute(command: C): any {
        if (!this.canExecute(command))
            throw new Error(`${this.constructor.name} cannot execute command ${command.name}`)

        return this._execute(command)
    }

    protected abstract _execute(command: C): object | Promise<object>

}

export abstract class ServiceModule<C extends Command = any, M extends Modules = any, S extends object = Empty> extends CommandModule<C, S> {

    readonly modules: M
    constructor(
        modules: M, 
        settings: S
    ) {
        super(settings)
        this.modules = modules.map(m => m.parentTo(this)) as unknown as M
    }
    
    // Convenience getters
    get commandModules(): CommandModule<C>[] {
        return this
            .modules
            .filter((m): m is CommandModule<C> => `execute` in m)
    }

    // Service Implementation

    private _path = ``
    get path(): string {
        return this._path
    }

    override parentTo(parent: ServiceModule<any, any, any>): this {
        const clone = new (this.constructor as any)(this.modules, this.settings)
        clone._parent = parent
        clone._path = this._path
        return clone
    }
    
    parentToWithPath(parent: ServiceModule<any,any,any>, path: string):this {
        const clone = this.parentTo(parent)
        clone._path = path
    
        return clone
    }

    // Command Implementation 
    
    _execute(command: Command): any {
        const module = this
            .commandModules
            .find(m => m.canExecute(command)) as CommandModule
    
        return module.execute(command)
    }
    
    canExecute(command: Command): command is C {
        return this
            .commandModules
            .some(m => m.canExecute(command))
    }

    // Module Implementation

    override get<M extends Module<any>, R extends boolean = false>(
        type: ModuleConstructor<M>, 
        required: R = false as R
    ): R extends true ? M : M | null {

        const module = this.modules.find(m => m instanceof type) ?? null
        if (!module && required)
            throw new Error(`${this.constructor.name} is missing module ${type.name}`)

        return module as M
    }

    //

    override validateModules(): void {
        this.modules.forEach(m => m.validateModules())
    }

}
