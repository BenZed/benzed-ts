
import { TypeValidator } from '../validator'
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import Schema from './schema'

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

function toEnumTypeName(input: EnumSchemaInput): string {
    const [last, ...first] = [...input].reverse()
    // c, ...ba

    return first.reverse() // ab
        .join(', ') // a, b
        .concat(
            last ? ` or ${last}` : ''
        ) // a, b or c
}

/*** Main ***/

class EnumSchema<I extends EnumSchemaInput, O extends EnumSchemaOutput<I>, F extends Flags[] = []>
    extends Schema<I, O, F> {

    protected _typeValidator = new TypeValidator<O>({
        name: toEnumTypeName(this._input),
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