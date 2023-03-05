import { is } from '@benzed/is'

import { FindNode, HasNode, AssertNode, Node } from '@benzed/node'
import { Structural } from '@benzed/immutable'
import { Traits } from '@benzed/traits'
import { nil } from '@benzed/util'

//// Main ////

/**
 * Module is the most base class of an Application.
 */
abstract class Module extends Traits.use(Node, Structural) {

    static readonly use = Traits.use
    static readonly add = Traits.add

    static readonly copy: typeof Structural.copy = Structural.copy
    static readonly state: typeof Structural.state = Structural.state
    static readonly equals: typeof Structural.equals = Structural.equals

    static nameOf(input: object): string {
        if ('name' in input && is.string(input.name))
            return input.name
        return input.constructor.name
    }

    constructor() {
        super() 
        return Node.apply(this)
    }

    get name() {
        return this.constructor.name
    }

    get parent(): Module | nil {
        return Node.getParent(this)
    }

    get root(): Module {
        return Node.getRoot(this) as Module
    }
    
    get modules(): Module[] {
        return Array.from(Node.eachChild(this)) as Module[]
    }

    get find(): FindNode<Module> {
        return Node.find(this)
    }

    get has(): HasNode<Module> {
        return Node.has(this)
    }

    get assert(): AssertNode<Module> {
        return Node.assert(this)
    }

    // get client(): Client | nil { return this.find.inRoot(Client) }

    // get server(): Server | nil { return this.find.inRoot(Server) }

} 

//// Exports ////

export default Module
 
export {
    Module
}