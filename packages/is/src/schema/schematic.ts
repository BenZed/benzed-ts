import { Callable, TypeAssertion, TypeGuard } from '@benzed/util'

import { Validate } from '../validator'
import { schemaFrom } from './schema-from'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-var-requires
*/

//// Types ////

interface SchematicMethods<O extends I, I = unknown> {
    is: TypeGuard<O, I>
    assert: TypeAssertion<O, I>
    validate: Validate<I, O>
}

/**
 * @internal
 */
type AnySchematic = Schematic<any,any>

//// Main ////

class Schematic<
    O extends I, 
    I = unknown
> extends Callable<TypeGuard<O, I>> implements SchematicMethods<O,I> {

    static get from(): typeof schemaFrom {
        return require('./schema-from').schemaFrom
    }

    readonly is: TypeGuard<O,I>
    readonly assert: TypeAssertion<O,I>
    readonly validate: Validate<I, O>

    constructor(validate: Validate<I,O>) {

        const is = (i: I): i is O => {
            try {
                void this.assert(i)
                return true
            } catch {
                return false
            }
        }

        const assert = (i: I): asserts i is O => 
            void this.validate(i, { transform: false }) 

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
    SchematicMethods,
    AnySchematic
}