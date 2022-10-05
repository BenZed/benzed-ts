import Schema from './schema'

import {
    toOptionsString
} from '../util'

import {
    TypeValidator
} from '../validator/type'

import {
    Flags,
    AddFlag,
    HasMutable,
    HasOptional
} from './flags'

import {
    TupleSchemaInput,
    TupleSchemaOutput
} from './tuple'

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

type UnionSchemaInput = TupleSchemaInput
type UnionSchemaOutput<T extends UnionSchemaInput> = TupleSchemaOutput<T>[number]

/*** Helper ***/

function isUnion<O>(schemas: UnionSchemaInput): (input: unknown) => input is O {
    return (input): input is O => schemas.some(schema => schema.is(input))
}

/*** Main ***/

class UnionSchema<

    I extends UnionSchemaInput,
    O extends UnionSchemaOutput<I>,
    F extends Flags[] = []

/**/> extends Schema<I, O, F> {

    protected _typeValidator = new TypeValidator({
        name: toOptionsString(this._input.map(s => s.typeName)),
        is: isUnion<O>(this._input)
    })

    /*** Schema Interface ***/

    public override readonly optional!: HasOptional<
    /**/ F, never, UnionSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, UnionSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => UnionSchema<I, O>

}

/*** Exports ***/

export default UnionSchema

export {
    UnionSchema,
    UnionSchemaInput,
    UnionSchemaOutput
}