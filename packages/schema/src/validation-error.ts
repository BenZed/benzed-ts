import { words } from '@benzed/string'
import { each, GenericObject, isNumber, isString, isSymbol, nil } from '@benzed/util'

import { ValidationContext } from './validation-context'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Type ////

type ValidationErrorJson<T> = string | (T extends Array<infer I>

    ? readonly (ValidationErrorJson<I> | null)[]
    : T extends object
        ? {
            readonly [K in keyof T]: ValidationErrorJson<T[K]>
        }
        : string)

type ValidationErrorMessage<I, O extends I = I> = string | ((input: I, ctx: ValidationContext<I,O>) => string)

//// Helper ////

/**
 * ['key', 0, Symbol(symbolic-key)] => key[0][$$symbolic-key]
 */
function formatPath(path: PropertyKey[]): string {
    const formatted = path
        .map((k, i) => {

            const name = isSymbol(k)
                ? `$$${k.description}`
                : `${k}`

            return i === 0 ? name : isString(k) 
                ? `.${name}` 
                : `[${name}]`
        })
        .join('')

    return isNumber(path[0])
        ? 'index ' + formatted
        : formatted
}

/**
 * Create a json error object out of a validation context.
 */
function toErrorJson<T>(
    ctx: ValidationContext<T, any>
): ValidationErrorJson<T> {

    const subCtxs = ctx.subContexts
    if (!subCtxs) {
        return (ctx.hasError() 
            ? ctx.getError() 
            : null
        ) as ValidationErrorJson<T>
    }

    const json: GenericObject = {}

    let allNumericKeys = true
    for (const subCtx of each.valueOf(subCtxs)) {
        if (subCtx.key === nil)
            continue 

        if (!isNumber(subCtx.key))
            allNumericKeys = false 

        json[subCtx.key] = toErrorJson(subCtx)
    }

    return (
        allNumericKeys
            ? each.valueOf(json).toArray()
            : json
    ) as ValidationErrorJson<T>
}

//// Main ////

class ValidationError<T> extends Error {

    static readonly toErrorJson = toErrorJson

    override get name(): string {
        return this.constructor.name
    }

    get value(): T {
        return this.ctx.input
    }

    get path(): PropertyKey[] {
        return this.ctx.path
    }

    readonly json: ValidationErrorJson<T>

    constructor(readonly ctx: ValidationContext<T, any>) {

        const firstErrorCtx = ctx.hasError()
            ? ctx 
            : ctx.findSubContext.inDescendents(sub => sub.hasError())

        const message = firstErrorCtx
            ? words(
                formatPath(firstErrorCtx.path),
                firstErrorCtx.getError()
            )
            : 'Validation incomplete'

        super(message)
        this.json = toErrorJson(ctx) || message
    }

    toJSON(): ValidationErrorJson<T> {
        return this.json
    }

}

//// Exports ////

export default ValidationError

export {
    ValidationError,
    ValidationErrorMessage,
    ValidationErrorJson
}