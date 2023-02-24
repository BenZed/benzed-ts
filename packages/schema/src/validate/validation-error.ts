import { capitalize, words } from '@benzed/string'
import { isNumber, isString } from '@benzed/util'
import { pipe } from '@benzed/pipe'

//// Type ////

type ValidationErrorDetail<T> = string | (T extends Array<infer I>

    ? ValidationErrorDetail<I>[]
    : T extends object
        ? {
            [K in keyof T]: ValidationErrorDetail<T[K]>
        }
        : string)

//// Main ////

class ValidationError<T> extends Error {

    override get name(): string {
        return this.constructor.name
    }

    readonly value: T

    readonly key?: PropertyKey

    readonly detail?: ValidationErrorDetail<T>

    constructor(
        input: {
            key?: PropertyKey
            value: T
            detail?: ValidationErrorDetail<T>
        }
    ) {

        const prefix = isNumber(input.key)
            ? `index ${input.key}`
            : input.key 
                ? `property ${String(input.key)}`
                : ''

        const suffix = isString(input.detail)
            ? input.detail 
            : 'validation failed'

        const [ message ] = pipe(prefix)
            .to(words, suffix)
            .to(capitalize)

        super(message)

        this.key = input.key
        this.value = input.value
        this.detail = input.detail
    }

}

//// Exports ////

export default ValidationError

export {
    ValidationError,
    ValidationErrorDetail
}