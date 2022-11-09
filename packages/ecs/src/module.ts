
import { $$copy } from "@benzed/immutable"
import type _Node from "./node"

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Symbols ////

const $$params = Symbol(`immutable-copy-params`)

//// Types ////

type Modules = readonly _Module[]

type ModuleConstructor = new (...params: any[]) => _Module

type ModuleParams<T extends ModuleConstructor> = ConstructorParameters<T> 

//// Main ////

class _Module {

    private _parent: _Node<Modules> | null = null
    get parent(): _Node<Modules> | null {
        return this._parent
    }

    /**
     * @internal
     */
    _setParent(parent: _Node<Modules> | null): this {
        this._parent = parent
        return this
    }

    //// Set It And Forget It Immutability ////
    // (Provided super() calls are done correctly)

    /**
     * Create an instance of any module without having
     * to worry about private constructors.
     * 
     * For internal use, only.
     * @internal
     */
    static _create<T extends ModuleConstructor>(
        type: T,
        params: ModuleParams<T>
    ): InstanceType<T> {
        return new type(...params) as InstanceType<T>
    }
    
    constructor(
        ...params: unknown[]
    ) {
        this[$$params] = params
    }

    private readonly [$$params]: unknown[]

    [$$copy](): this {

        const Constructor = this.constructor as (new (...params: unknown[]) => this)

        return _Module._create(
            Constructor, this[$$params]
        )
    }
}

/*** Export ***/

export default _Module

export {
    _Module,
    Modules,
    ModuleConstructor,
    ModuleParams,

    $$params
}