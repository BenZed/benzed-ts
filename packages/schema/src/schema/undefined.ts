import { TypeValidator } from '../validator/type'

import { Flags, AddFlag, HasOptional, HasMutable } from './flags'

import { PrimitiveSchema } from './schema'

/*** Helper ***/

function isUndefined(input: unknown): input is undefined {
    return input === undefined
}

function tryCastToUndefined(input: unknown): unknown {
    // "undefined" to undefined
    return input === null || input === 'undefined'
        ? undefined
        : input
}

/*** Exports ***/

export default class UndefinedSchema<F extends Flags[] = []> extends PrimitiveSchema<undefined, F> {

    public constructor (...flags: F) {
        super(undefined, ...flags)
    }

    protected _typeValidator = new TypeValidator({
        name: 'undefined',
        is: isUndefined,
        cast: tryCastToUndefined
    })

    public override readonly optional!: HasOptional<
    /**/ F, () => never, () => UndefinedSchema<AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, () => never, () => UndefinedSchema<AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => UndefinedSchema

    public override default(): this {
        return super.default(undefined)
    }

}

export {
    UndefinedSchema
}