import Component, { ComponentConstructor, ComponentParams, Components } from "./component"
import { Entity } from './entity'

//// Setup ////

class Module extends Component {

    constructor(
        parent: Component | null,
        readonly count: number
    ) {
        super(parent)
    }

}

class Node<C extends Components> extends Entity<C> {

    _use<T extends ComponentConstructor>(type: T) {
        return (...params: ComponentParams<T>) => this._push(type, params)
    }

    _push<T extends ComponentConstructor>(type: T, params: ComponentParams<T>): Node<[...C, InstanceType<T>]> {
        return new Node(
            this.parent, 
            [
                ...this.components, 
                Component.create(type, this, params)
            ]
        )
    }

    readonly useModule = this._use(Module)

}

//// Tests ////

it(`is abstract`, () => {
    // @ts-expect-error Sealed
    void class extends Entity<[]> {}
})