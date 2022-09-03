import { $$copy, $$equals, copy, CopyComparable } from '@benzed/immutable'

import { Flags, HasOptional, HasMutable, AddFlag } from './flags'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type SchemaOutput<S extends Schema<any, any>> = S extends Schema<infer T, infer F>
    ? HasOptional<F, T | undefined, T>
    : never

/*** Main ***/

abstract class Schema<T, F extends Flags[] = []> implements CopyComparable<Schema<T, F>> {

    private readonly _flags: F

    private readonly _default!: T

    // Construct

    public constructor (...flags: F) {
        this._flags = flags
    }

    // Data Methods

    public is(input: unknown): input is T {
        try {
            this.assert(input)
            return true
        } catch {
            return false
        }
    }

    public assert(input: unknown, _msg = 'incorrect type'): asserts input is T {
        void this._validate(input, false)
    }

    public validate(input: unknown): T {
        return this._validate(input, true)
    }

    public create(): T {
        return copy(this._default)
    }

    // Schema Methods

    /**
     * @returns schema with optional flag
     */
    public readonly optional
    /**/: HasOptional<F, () => never, () => Schema<T, AddFlag<Flags.Optional, F>>>
        = this._copyWithFlag.bind(this, Flags.Optional) as any

    /**
     * @returns schema with mutable flag 
     */
    public readonly mutable
    /**/: HasMutable<F, () => never, () => Schema<T, AddFlag<Flags.Mutable, F>>>
        = this._copyWithFlag.bind(this, Flags.Mutable) as any

    public get isOptional(): boolean {
        return this._flags.includes(Flags.Optional)
    }

    public get isMutable(): boolean {
        return this._flags.includes(Flags.Mutable)
    }

    /**
     * @returns schema without optional or mutable flags.
     */
    public readonly clearFlags: () => Schema<T> = () => {
        const schema = this[$$copy]()
        schema._flags.length = 0
        return schema as any
    }

    // Helper

    private _validate(input: unknown, sanitize: boolean): T {
        void input
        void sanitize
        throw new Error('Not yet implemented.')
    }

    private _copyWithFlag(flag: Flags): this {

        if (this._flags.includes(flag))
            throw new Error(`Schema is already ${Flags[flag]}`)

        const schema = this[$$copy]()
        schema._flags.push(flag)

        return schema
    }

    // CopyComparable 

    public [$$copy](): this {
        const ThisSchema = this.constructor as new (...flags: Flags[]) => this
        const schema = new ThisSchema(...this._flags)
        return schema
    }

    public [$$equals](input: unknown): input is this {
        throw new Error('Not yet implemented.')
    }

}

/*** Exports ***/

export default Schema

export {
    Schema,
    SchemaOutput
}

