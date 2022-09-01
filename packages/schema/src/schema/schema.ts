import { $$copy, $$equals, copy, CopyComparable } from '@benzed/immutable'

import type { Flags, HasOptional, HasReadonly } from './flags'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type SchemaOutput<S extends Schema<any, any>> = S extends Schema<infer T, infer F>
    ? HasOptional<F, T | undefined, T>
    : never

/*** Main ***/

abstract class Schema<T, F extends Flags[]> implements CopyComparable<Schema<T, F>> {

    public readonly flags: F

    private readonly _default!: T

    public is(input: unknown): input is T {
        try {
            this.assert(input)
            return true
        } catch {
            return false
        }
    }

    public assert(input: unknown, _msg = 'incorrect type'): asserts input is T {
        throw new Error('Not yet implemented.')
    }

    public validate(input: unknown): T {
        return input as T
    }

    public create(): T {
        return copy(this._default)
    }

    public constructor (...flags: F) {
        this.flags = flags
        this.optional = null as any
        this.readonly = null as any
    }

    public [$$copy](): this {
        throw new Error('Not yet implemented.')
    }

    public [$$equals](input: unknown): input is this {
        throw new Error('Not yet implemented.')
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

