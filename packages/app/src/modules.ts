import is from '@benzed/is'
import { Empty } from '@benzed/util'
import { pluck } from '@benzed/array'

import { Command } from "./command"

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

export type Modules = readonly Module<any>[]

export type ModuleConstructor<M extends Module<any> = Module<any>> = new (...args: any[]) => M

export type SettingsOf<M extends Module<any>> = M extends Module<infer S> ? S : Empty

export abstract class Module<S extends object = Empty> {

    constructor() { 
        this._validateModules()
    }

    private _parent: ActionModule | null = null 
    get parent(): ActionModule | null{
        return this._parent
    }
    
    parentTo(parent: ActionModule): this {
        const clone = new (this.constructor as new () => this)
        clone._parent = parent

        return clone
    }

    // Component API

    get<M extends Module<any>>(type: ModuleConstructor<M>): M | null {
        return this.parent?.get(type) ?? null
    }

    has<M extends Module>(type: ModuleConstructor<M>): boolean {
        return !!this.get(type)
    }

    // Lifecycle Hooks 

    abstract start(settings: S): void | Promise<void> 

    abstract stop(): void | Promise<void>

    // Validation

    protected _validateModules(): void { /**/ }

    protected _assertSingle(): void { 
        if (this.has(this.constructor as ModuleConstructor))
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

export abstract class ActionModule<C extends Command = any, M extends Modules = any> extends Module<object> {

    constructor(readonly modules: M) {
        super()
    }

    private _path = ``
    get path(): string {
        return this._path
    }
    
    parentToWithPath(parent: ActionModule<any>, path: string):this {
        const clone = super.parentTo(parent)
        clone._path = path
    
        return clone
    }

    abstract execute(command: C): object

    abstract canExecute(command: Command): command is C

}

export class App<C extends Command = any, M extends Modules = Modules> extends ActionModule<C, M> {

    static create(): App<Command, []> {
        return new App([])
    }

    use<Mx extends Module<any>>(
        ...args: Mx extends ActionModule<any,any> 
            ? [path: string, module: Mx] | [module: Mx] 
            : [module: Mx]
    ): App<C, [...M, Mx]> {

        const path = pluck(args, is.string).at(0) 
        let module = pluck(args, m => is(m, Module)).at(0) as Mx | undefined
        if (!module)
            throw new Error(`${Module.name} not provided.`)

        module = path && module instanceof ActionModule
            ? module.parentToWithPath(this, path)
            : module.parentTo(this)

        return new App([...this.modules, module])
    }
}