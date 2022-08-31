
/*** Types ***/

type SchemaInput =
    | Schema<unknown>
    | { [key: string]: SchemaInput }

/* eslint-disable @typescript-eslint/indent */
type SchemaOutput<T> = T extends Schema<infer S>
    ? S

    : T extends { [key: string]: unknown }
    ? { [K in keyof T]: SchemaOutput<T[K]> }

    : T extends readonly [...infer A]
    ? { [I in keyof A]: SchemaOutput<A[I]> }

    : T extends Array<infer A>
    ? SchemaOutput<readonly A[]>

    : never

/*** Schema ***/
abstract class Schema<T> {

    public get default(): T {
        // TODO provide default
        return undefined as unknown as T
    }

    public get output(): T {
        return this.default
    }

    public readonly validate: (input: unknown) => T =
        input => input as T

    // public abstract readonly is: (input: unknown) => input is T

    // public abstract readonly assert: (input: unknown) => asserts input is T

}

/*** Primitive Schemas ***/

abstract class PrimitiveSchema<T extends number | boolean | string>
    extends Schema<T> {

    public constructor (
        protected defaultValue?: T
    ) {
        super()
    }

}

/*** Exports ***/

export default Schema

export {
    Schema,
    PrimitiveSchema,

    SchemaInput,
    SchemaOutput,

}