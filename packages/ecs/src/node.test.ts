import _Module, { ModuleConstructor, ModuleParams, Modules } from "./module"
import { _Node } from './node'

/* eslint-disable 
    @typescript-eslint/explicit-function-return-type
*/

//// Setup ////

class Module extends _Module {

    constructor(
        parent: _Module | null,
        readonly count: number
    ) {
        super(parent)
    }

}

class Node<C extends Modules> extends _Node<C> {

    static create(): Node<[]> {
        return new Node(null, [])
    }

    private constructor(
        ...args: ConstructorParameters<typeof _Node<C>>
    ) {
        super(...args)
    }

    _use<T extends ModuleConstructor>(type: T) {
        return (...params: ModuleParams<T>) => this._push(type, ...params)
    }

    _push<T extends ModuleConstructor>(type: T, ...params: ModuleParams<T>): Node<[...C, InstanceType<T>]> {
        return new Node(
            this.parent, 
            [
                ...this._build, 
                { type, params }
            ]
        )
    }

    readonly useModule = this._use(Module)

}

//// Tests ////

it(`is abstract`, () => {
    // @ts-expect-error Sealed
    void class extends _Node<[]> {}
})

it(`works`, () => {
    const node = Node.create().useModule(0).useModule(1)

})