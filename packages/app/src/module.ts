import { FindNode, HasNode, AssertNode, Node } from '@benzed/node'
import { Traits } from '@benzed/traits'
import { is } from '@benzed/is'
import { Structural } from '@benzed/immutable'
import { AnyTypeGuard, nil } from '@benzed/util'

//// Types ////

const $$module = Symbol('module-name')

//// Main ////

/**
 * Module is the most base class of an Application.
 */
abstract class Module extends Traits.use(Node, Structural) {

    static [Symbol.hasInstance](input: unknown): input is Module {
        return this.is(input)
    }

    static readonly is: (input: unknown) => input is Module = is.shape({
        [$$module]: is.string,
        [Node.parent]: is(Node).or.undefined,
        [Structural.equals]: is.function,
        [Structural.state]: is.object,
        [Structural.copy]: is.function,
    }).strict(false).named('Module') as AnyTypeGuard

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

} 

//// Exports ////

export default Module
 
export {
    Module,
    $$module
}