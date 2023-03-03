import { Node } from '@benzed/node'
import { Traits } from '@benzed/traits'
import { is } from '@benzed/is'
import { Structural } from '@benzed/immutable'
import { AnyTypeGuard } from '@benzed/util'

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

    get name() {
        return this[$$module]
    }

    get [$$module]() {
        return this.constructor.name
    }

} 

//// Exports ////

export default Module
 
export {
    Module,
    $$module
}