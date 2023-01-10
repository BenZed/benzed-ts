import { CallableStruct } from '@benzed/immutable'
import { TypeAssertion, TypeGuard } from '@benzed/util'

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
> extends CallableStruct<TypeGuard<O, I>> implements SchematicMethods<O,I> {

    static get from(): typeof schemaFrom {
        return require('./schema-from').schemaFrom
    }

    constructor(validate: Validate<I,O>)
    constructor(settings: Partial<ValidatorSettings<I,O>>)
    constructor(input: Validate<I,O> | Partial<ValidatorSettings<I,O>>) {
        super((i): i is O => this.is(i))
        this.validate = Validator.from(input)
        this._bindSchematicMethods()
    }

    readonly validate: Validate<I, O>

    is(i: I): i is O {
        try {
            void this.assert(i) 
            return true
        } catch {
            return false
        }
    }

    assert(i: I): asserts i is O {
        void this.validate(i, { transform: false }) 
    }

    //// Copy ////
    
    override copy(): this {
        const clone = super.copy()
        clone._bindSchematicMethods()
        return clone
    }

    //// Helper ////
    
    private _bindSchematicMethods(): void {
        const { is, assert } = Schematic.prototype
        this.is = is.bind(this) 
        this.assert = assert.bind(this)
    }
}

//// Exports ////

export default Schematic 

export {
    Schematic,
    SchematicMethods,
    AnySchematic
}