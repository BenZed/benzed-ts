import Module from './module'

//// Main ////

class Modules<M extends readonly Module[]> extends Module<M> implements Iterable<M[number]> {

    /**
     * Get children of this module.
     */
    override get modules(): M {
        return this.state
    }

    override setState(state: M): this {
        const Constructor = this.constructor as new (...modules: M) => this
        return new Constructor(...state)
    }

    constructor(...modules: M) {

        super(modules)

        for (const module of this) 
            module._applyParent(this)
    }

    *[Symbol.iterator](): Iterator<M[number]> {
        yield* this.state
    }

}

//// Exports ////

export default Modules

export {
    Modules
}