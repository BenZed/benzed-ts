import Component, { ComponentConstructor, ComponentParams, Components } from './component'

//// Main ////

abstract class Entity<C extends Components> extends Component {

    constructor(
        parent: Component | null,
        readonly components: C
    ) {
        super(parent)
    }

    /**
     * @internal
     */
    abstract _use<T extends ComponentConstructor>(type: T): (...params: ComponentParams<T>) => Entity<[...C, InstanceType<T>]>

    /**
     * @internal
     */
    abstract _push<T extends ComponentConstructor>(type: T, params: ComponentParams<T>): Entity<[...C, InstanceType<T>]>

}

//// Exports ////

export default Entity

export {
    Entity
}