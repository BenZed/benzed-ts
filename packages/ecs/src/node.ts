import { $$copy } from '@benzed/immutable'

import _Module, { ModuleConstructor, ModuleParams, Modules } from './module'

//// Main ////

abstract class _Node<C extends Modules> extends _Module {

    private _modules: C | null = null
    get modules(): C {
        if (!this._modules)
            this._modules = this._build.map(({ type, params }) => _Module._create(type, this, params)) as unknown as C

        return this._modules
    }

    constructor(
        parent: _Module | null,
        protected readonly _build: { type: ModuleConstructor, params: ModuleParams<ModuleConstructor> }[]
    ) {
        super(parent)
    }

    /**
     * @internal
     */
    abstract _use<T extends ModuleConstructor>(type: T): (...params: ModuleParams<T>) => _Node<[...C, InstanceType<T>]>

    /**
     * @internal
     */
    abstract _push<T extends ModuleConstructor>(type: T, ...params: ModuleParams<T>): _Node<[...C, InstanceType<T>]>

    /**
     * @internal
     */
    [$$copy](): this {
        return new (this.constructor as ModuleConstructor)(this.parent, this._build) as this
    }
}

//// Exports ////

export default _Node

export {
    _Node
}