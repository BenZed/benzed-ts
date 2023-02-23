import { define, Func } from '@benzed/util'

import { Trait } from '../trait'
import { Callable } from './callable'

//// Main ////

type FunctionConstructor = abstract new <F extends Func>(signature: F) => Callable<F>

/**
 * Convenience base class implementing the Callable trait that
 * simply takes the call signature as an argument.
 */
const Function = class extends Trait.use(Callable) {

    constructor(signature: Func) {
        super()
        define.hidden(this, Callable.signature, signature)
    }

} as FunctionConstructor

//// Exports ////

export { Function }