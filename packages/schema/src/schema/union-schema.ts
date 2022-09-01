
import { Flags, HasReadonly, HasOptional } from './flags'

import Schema, { SchemaOutput } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type UnionSchemaInput = readonly (string | number | Schema<any, any>)[]
type UnionSchemaOutput<T extends UnionSchemaInput> = {
    [K in keyof T]: T[K] extends string | number
    /**/ ? T[K]
    /**/ : T[K] extends Schema<any, any>
        // @ts-expect-error T[K] is resolving to Schema<any,any> & T[K], which I don't get
            /**/ ? SchemaOutput<T[K]>
            /**/ : unknown
}[number]

/*** Main ***/

class UnionSchema<T, F extends Flags[]> extends Schema<T, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => UnionSchema<T, [...F, Flags.Optional]>
    >

    public override readonly readonly!: HasReadonly<
    /**/ F, never, () => UnionSchema<T, [...F, Flags.Readonly]>
    >

}

/*** Exports ***/

export default UnionSchema

export {
    UnionSchema,
    UnionSchemaInput,
    UnionSchemaOutput
}