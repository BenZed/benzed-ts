import { copy } from '@benzed/immutable'
import Module from './module'

//// Main ////

class Modules<M extends readonly Module[]> extends Module<M> {

    /**
     * Get children of this module.
     */
    override get modules(): M {
        return this._state
    }

    constructor(modules: M) {

        super(copy(modules))

        for (const module of this.modules)  
            module._setParent(this)
    }

}

//// Exports ////

export default Modules

export {
    Modules
}