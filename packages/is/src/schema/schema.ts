import { ContextPipe, nil, Pipe, TypeAssertion, TypeGuard } from '@benzed/util'

import { 
    ValidationErrorMessage, 
    
    Validate, 
    ValidatorContext, 
    ValidatorSettings, 
    
    Validator, 
    ValidateOptions 
} from '../validator'

//// Type ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type Infer<S extends Schema<any>> = S extends Schema<infer T> ? T : unknown

type Assert<T> = T extends Schema<infer Tx> 
    ? Assert<Tx> 
    : (input: unknown) => asserts input is T

interface AddValidatorOptions {
    
    id?: string | number | symbol

    replace?: boolean
    
    name?: string
}

class Schematic<T = unknown> extends Validate<unknown, T> {

    is: TypeGuard<T> = (input): input is T => {
        try {
            void this.validate(input, { transform: false })
            return true
        } catch {
            return false
        }
    }

    assert: TypeAssertion<T> = (input): asserts input is T => 
        void this.validate(input, { transform: false })

    constructor(readonly validate: Validate<unknown, T>) {
        super(validate)
    }

}

class Schema<T = unknown> extends Schematic<T> implements Iterable<Validate<unknown>> {

    constructor() {
        super((input, options) => this._pipe(input, options))
    }

    private readonly _pipe: ContextPipe<unknown, T, ValidateOptions | nil> 
    
    *[Symbol.iterator](): IterableIterator<Validate<unknown>> {
        yield* this._pipe
    }

    get validators(): Validate<unknown>[] {
        return Array.from(this._pipe)
    }

    validates(
        validate: Validate<T>,
        id?: string | number | symbol
    ): this

    validates(
        settings: ValidatorSettings<T>,
        id?: string | number | symbol
    ): this

    asserts(
        assert: (i: T, ctx: ValidatorContext<T>) => boolean,
        msg?: string | ValidationErrorMessage<T>,
        id?: string | number | symbol
    ): this

    transforms(
        transform: (i: T, ctx: ValidatorContext<T>) => T,
        msg?: string | ValidationErrorMessage<T>,
        id?: string | number | symbol
    ): this

}

//// Extendable  ////

// const schematic = extend(validateAll, {

//     validates(
//         this: Schema, 
//         settings: ValidatorSettings<unknown, unknown>,
//         id?: number | string | symbol
//     ): Schema {

//         const index = id === nil 
//             ? -1 
//             : this.validators.findIndex(v => v.id === id)

//         const validate = new Validator(settings)

//         const validators = [ ...this.validators ]
//         if (index in validators)
//             validators.splice(index, 1, validate)
//         else 
//             validators.push(validate)

//         return this.extend({ validators })
//     },

//     getValidator<V extends Validator<unknown>>(id: string | number | symbol): V | nil {
//         return this
//             .validators
//             .find(v => 
//                 $$id in v && 
//                 (v as V & { [$$id]: string | number | symbol })[$$id] === id
//             ) as V | nil
//     },

//     validators: [] as Validator<unknown>[],

//     transforms(
//         this: Schema, 
//         transform: (i: unknown, ctx: ValidatorContext<unknown>) => unknown,
//         error?: string | ErrorMessage,
//         id?: number | string | symbol
//     ): Schema {
//         return this.validates({ transform, error }, id)
//     },
    
//     asserts(
//         this: Schema, 
//         assert: (i: unknown, ctx: ValidatorContext<unknown>) => boolean, 
//         error?: string | ErrorMessage,
//         id?: number | string | symbol
//     ): Schema {
//         return this.validates({ assert, error }, id)
//     },

// }) as Schema

//// Exports ////

export default Schema

export {
    Schema,

    Infer,
    Assert
}
