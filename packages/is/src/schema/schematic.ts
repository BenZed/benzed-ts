import { Callable, TypeAssertion, TypeGuard } from '@benzed/util'

import { Validate } from '../validator'

//// Types ////

interface SchematicMethods<O extends I, I = unknown> {
    is: TypeGuard<O, I>
    assert: TypeAssertion<O, I>
    validate: Validate<I, O>
}

//// Main ////

class Schematic<
    O extends I, 
    I = unknown 
> extends Callable<TypeGuard<O, I>> implements SchematicMethods<O,I> {

    is: TypeGuard<O, I>
    assert: TypeAssertion<O, I>
    validate: Validate<I, O>

    constructor({ is, assert, validate }: SchematicMethods<O,I>) {
        super(is)
        this.is = is 
        this.assert = assert 
        this.validate = validate
    }

}

//// Exports ////

export default Schematic 

export {
    Schematic,
    SchematicMethods
}