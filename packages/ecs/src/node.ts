
import _Module, { ModuleConstructor, ModuleParams, Modules } from './module'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Module Implementations for Extended Classes ////

function useModule<Mx extends _Module, M extends _Node<Modules>>(this: M, module: Mx): M {
    return _Module._create(
        this.constructor as ModuleConstructor,
        [...this.modules, module]
    ) as M
}

type UseModuleType<T extends ModuleConstructor, M extends _Node<Modules>> = (...params: ModuleParams<T>) => M
const useModuleType = <T extends ModuleConstructor, M extends _Node<Modules>> (type: T): UseModuleType<T, M> => 
    function (this: M, ...params: ModuleParams<T>) {
        return this.useModule(
            _Module._create(type, params)
        ) as unknown as M
    }

type UseModuleInit<T extends ModuleConstructor, M extends _Node<Modules>> = <I extends (i: InstanceType<T>) => InstanceType<T>>(init: I) => M
const useModuleInit = <T extends ModuleConstructor, M extends _Node<Modules>> (type: T, ...params: ModuleParams<T>): UseModuleInit<T, M> => 
    function (this: M, init: any) { 
        return this.useModule(
            init(
                _Module._create(type, params)
            ) 
        ) as unknown as M
    } 

//// Main ////

abstract class _Node<M extends Modules> extends _Module {

    readonly modules: M

    constructor (...modules: M) {

        super(...modules)
        this.modules = modules
        this.modules.forEach(m => {
            m._setParent(this)
        })
    }

    /**
     * Parent a module instance to this node.
     */
    abstract useModule: <Mx extends _Module>(module: Mx) => _Node<[...M, Mx]>

    abstract _useModuleType<T extends ModuleConstructor>(type: T): UseModuleType<T, _Node<[...M, InstanceType<T>]>>

    abstract _useModuleInit<T extends ModuleConstructor>(type: T, ...params: ModuleParams<T>): UseModuleInit<T, _Node<[...M, InstanceType<T>]>>

}

//// Exports ////

export default _Node

export {
    _Node,
    
    useModule,

    UseModuleInit,
    useModuleInit,

    UseModuleType,
    useModuleType,
}