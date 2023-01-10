import { StructCallable } from '@benzed/immutable'
import { Mutable, TypeAssertion, TypeGuard } from '@benzed/util'

import { Validate, Validator, ValidatorSettings } from '../validator'
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
> extends StructCallable<TypeGuard<O, I>> implements SchematicMethods<O,I> {

    static get from(): typeof schemaFrom {
        return require('./schema-from').schemaFrom
    }

    readonly is!: TypeGuard<O,I>
    readonly assert!: TypeAssertion<O,I>
    readonly validate: Validate<I, O>

    constructor(validate: Validate<I,O>)
    constructor(settings: Partial<ValidatorSettings<I,O>>)
    constructor(input: Validate<I,O> | Partial<ValidatorSettings<I,O>>) {

        super((i): i is O => this.is(i))

        this.validate = Validator.from(input)
    }

    override initialize(): this {

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

        const that = this as Mutable<this>
        that.is = is 
        that.assert = assert

        return this
        
    }

}

//// Exports ////

export default Schematic 

export {
    Schematic,
    SchematicMethods,
    AnySchematic
}