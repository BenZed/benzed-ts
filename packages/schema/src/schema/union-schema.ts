
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'
import Schema, { SchemaOutput } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type UnionSchemaInput = readonly (string | number | Schema<any, any, any>)[]
type UnionSchemaOutput<T extends UnionSchemaInput> = {
    [K in keyof T]: T[K] extends string | number
    /**/ ? T[K]
    /**/ : T[K] extends Schema<any, any, any>
        // @ts-expect-error T[K] is resolving to Schema<any,any, any> & T[K], which I don't get
            /**/ ? SchemaOutput<T[K]>
            /**/ : unknown
}[number]

/*** Main ***/

class UnionSchema<
    I extends UnionSchemaInput,
    O extends UnionSchemaOutput<I>,
    F extends Flags[] = []
    /**/> extends Schema<I, O, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => UnionSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => UnionSchema<I, O, AddFlag<Flags.Mutable, F>>
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