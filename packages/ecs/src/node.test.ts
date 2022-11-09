import { copy } from "@benzed/immutable"
import _Module, { ModuleConstructor, ModuleParams, Modules } from "./module"
import { _Node, UseModuleInit, UseModuleType, useModule, useModuleInit, useModuleType } from './node'

//// Setup ////

class Test extends _Module {

    constructor(
        readonly count: number
    ) {
        super(count)
    }

}

class Node<M extends Modules> extends _Node<M> {

    //// Sealed ////
    
    static create(): Node<[]> {
        return new Node()
    }

    private constructor(
        ...modules: M
    ) {
        super(...modules)
    }

    //// Build Interface Implementation ////
    
    useModule: <Mx extends _Module>(module: Mx) => Node<[...M, Mx]> = 
        useModule

    _useModuleType: <T extends ModuleConstructor>(type: T) => UseModuleType<T, Node<[...M, InstanceType<T>]>> = 
        useModuleType

    _useModuleInit: <T extends ModuleConstructor> (type: T, ...params: ModuleParams<T>) => UseModuleInit<T, Node<[...M, InstanceType<T>]>> = 
        useModuleInit

    //// Build Interface ////

    readonly useTest = this._useModuleType(Test)

    readonly useTestInit = this._useModuleInit(Test, 0)
}

//// Tests ////

it(`is abstract`, () => {
    // @ts-expect-error Sealed
    void class extends _Node<[]> {}
})

it(`works`, () => {
    const node = Node
        .create()
        .useTest(10)
        .useTestInit(copy)

    console.log(node)

})