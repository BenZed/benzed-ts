import type { Flags, HasOptional, HasReadonly } from './flags'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type SchemaOutput<S extends Schema<any, any>> = S extends Schema<infer T, infer F>
    ? HasOptional<F, T | undefined, T>
    : never

/*** Main ***/

abstract class Schema<T, F extends Flags[]> {

    public readonly flags: F

    private readonly _default!: T

    public constructor (...flags: F) {
        this.flags = flags
        this.optional = null as any
        this.readonly = null as any
    }

    public readonly optional: HasOptional<
    /**/ F, never, () => Schema<T, [...F, Flags.Optional]>
    >

    public readonly readonly: HasReadonly<
    /**/ F, never, () => Schema<T, [...F, Flags.Readonly]>
    >
}

/*** Exports ***/

export default Schema

export {
    Schema,
    SchemaOutput
}

