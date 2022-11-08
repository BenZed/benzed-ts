import { $$copy } from '@benzed/immutable'

import type Node from './node'

/*** Types ***/

type Modules = readonly Module[]

/*** Module ***/

class Module {

    private _node: Node | null = null
    get node(): Node | null {
        return this._node
    }

    /**
     * Set parent of this module
     * @internal
     * @param node Parent 
     * @returns 
     */
    _setNode(node: Node): this {
        this._node = node
        return this
    }

    copy(): this {
        return this[$$copy]()
    }
    
    [$$copy](): this {
        const ThisModule = this.constructor as (new (...params: unknown[]) => this)
        return new ThisModule(...this._copyParams)
    }

    protected get _copyParams(): unknown[] {
        return []
    }

}

/*** Export ***/

export default Module

export {
    Module,
    Modules
}