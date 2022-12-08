
import Schema from './schema'

import { toOptionsString } from '../util'

import {
    Flags,
    AddFlag,
    HasMutable,
    HasOptional
} from './flags'

import { TypeValidator } from '../validator/type'

//// Type ////

type EnumSchemaInput = readonly (string | number | boolean | null | undefined)[]

type EnumSchemaOutput<I extends EnumSchemaInput> = I[number]

//// Helper ////

function isEnumValue<
    I extends EnumSchemaInput,
    O extends EnumSchemaOutput<I>
>(values: I): (input: unknown) => input is O {
    return (input): input is O =>
        values.some(value => value === input)
}

//// Main ////

class EnumSchema<I extends EnumSchemaInput, O extends EnumSchemaOutput<I>, F extends Flags[] = []>
    extends Schema<I, O, F> {

    protected _typeValidator = new TypeValidator<O>({
        name: toOptionsString(this._input),
        is: isEnumValue(this._input)
    })

    override default(defaultValue: O | (() => O) = this._input[0] as O): this {
        return super.default(defaultValue)
    }

}

interface EnumSchema<I extends EnumSchemaInput, O extends EnumSchemaOutput<I>, F extends Flags[] = []> {

    readonly optional: HasOptional<
    /**/ F, never, () => EnumSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    readonly mutable: HasMutable<
    /**/ F, never, () => EnumSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    readonly clearFlags: () => EnumSchema<I, O>

}

//// Expors ////

export default EnumSchema

export {
    EnumSchema,
    EnumSchemaInput,
    EnumSchemaOutput
}