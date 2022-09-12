
import Schema from './schema'

import { toOptionsString } from '../util'

import {
    Flags,
    AddFlag,
    HasMutable,
    HasOptional
} from './flags'

import { TypeValidator } from '../validator/type'

/*** Type ***/

type EnumSchemaInput = readonly (string | number | boolean)[]

type EnumSchemaOutput<I extends EnumSchemaInput> = I[number]

/*** Helper ***/

function isEnumValue<
    I extends EnumSchemaInput,
    O extends EnumSchemaOutput<I>
>(values: I): (input: unknown) => input is O {

    return (input): input is O =>
        values.some(value => value === input)

}

/*** Main ***/

class EnumSchema<I extends EnumSchemaInput, O extends EnumSchemaOutput<I>, F extends Flags[] = []>
    extends Schema<I, O, F> {

    protected _typeValidator = new TypeValidator<O>({
        name: toOptionsString(this._input),
        is: isEnumValue(this._input)
    })

    public override readonly optional!: HasOptional<
    /**/ F, never, () => EnumSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => EnumSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => EnumSchema<I, O>

}

/*** Expors ***/

export default EnumSchema

export {
    EnumSchema,
    EnumSchemaInput,
    EnumSchemaOutput
}