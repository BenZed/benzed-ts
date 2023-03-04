import { FindNode, HasNode, AssertNode, Node } from '@benzed/node'
import { Traits } from '@benzed/traits'
import { is } from '@benzed/is'
import { Structural } from '@benzed/immutable'
import { nil } from '@benzed/util'

//// Types ////

const $$module = Symbol('module-name')

//// Main ////

/**
 * Module is the most base class of an Application.
 */
abstract class Module extends Traits.use(Node, Structural) {

    static readonly state: typeof Structural.state = Structural.state
    static readonly equals: typeof Structural.equals = Structural.equals
    static readonly copy: typeof Structural.copy = Structural.copy

    static nameOf(input: object): string {
        if ('name' in input && is.string(input.name))
            return input.name

        return input.constructor.name
    }

    static readonly use = Traits.use
    static readonly add = Traits.add

    constructor() {
        super() 
        return Node.apply(this)
    }

    get [$$module]() {
        return this.constructor.name
    }

    get name() {
        return this[$$module]
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
    Module,
    $$module
}