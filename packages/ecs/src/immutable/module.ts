import { $$copy } from '@benzed/immutable'
import type Node from './node'
import { $$setNode } from './symbols'

/*** Types ***/

type Modules = readonly Module[]

/*** Module ***/

class Module {

    private _node: Node | null = null
    get node(): Node | null {
        return this._node
    }

    /**
     * Should only be called by the node class after the node
     * has been copied and added to the node's list of modules.
     */
    [$$setNode](node: Node): this {
        this._node = node
        return this
    }

    copy(): this {
        return this[$$copy]()
    }
    
    [$$copy](): this {
        const ThisModule = this.constructor as (new () => this)
        return new ThisModule()
    }

}

/*** Export ***/

export default Module

export {
    Module,
    Modules
}