import { isString as _isString, memoize, Transform, TypeGuard } from '@benzed/util'
// import { capitalize } from '@benzed/string' <-- TODO wtf?? can't import this for some reason

import { ValidationErrorMessage } from '../../../validator'

import IsType from './is-type'  

//// Symbols ////

const $$trim = Symbol('trim-validator')
const $$case = Symbol('case-validator')
const $$start = Symbol('starts-with-validator')
const $$end = Symbol('ends-with-validator')

//// String Validate //// 

type Helper<I,O> = Record<string, Transform<I, O> | ((data: I) => Transform<I,O>)>

// Setup like this because function names is really nice for debugging, not
// necessarily for performacne
const StringTransform = { 

    trim: i => i.trim(),
    toUpper: i => i.toUpperCase(),
    toLower: i => i.toLowerCase(),
    capitalize: i => i.charAt(0).toUpperCase() + i.slice(1),
    ...memoize({
        startsWith: start => i => i.startsWith(start) ? i : start + i,
        endsWith: end => i => i.endsWith(end) ? i : end + i
    }),

} satisfies Helper<string, string>

const StringAssert = memoize({ 
    includes: value => i => i.includes(value) 
}) satisfies Helper<string, boolean>

//// String ////

class IsStringType<S extends string> extends IsType<string> {

    constructor(type: string, is: TypeGuard<S>) {
        super({ type, is }) 
    }

}

class IsString extends IsStringType<string> {

    constructor() {
        super('string', _isString) 
    }

    get trim(): this {

        return this.transforms(
            StringTransform.trim,
            'must not begin or end with whitespace',
            $$trim
        )
    }

    get upperCase(): this {
        return this.transforms(
            StringTransform.toUpper,
            'must be upper cased',
            $$case
        )
    }

    get lowerCase(): this {
        return this.transforms(
            StringTransform.toLower,
            'must be lower cased',
            $$case
        )
    }

    get capitalize(): this {
        return this.transforms(
            StringTransform.capitalize,
            'must be capitalized',
            $$case
        )
    }

    startsWith(start: string, error?: string | ValidationErrorMessage<string>): this {
        return this.transforms(
            StringTransform.startsWith(start), 
            error ?? `must start with "${start}"`,
            $$start
        )
    }

    endsWith(end: string, error?: string | ValidationErrorMessage<string>): this {
        return this.transforms(
            StringTransform.endsWith(end), 
            error ?? `must end with "${end}"`,
            $$end
        )
    }

    includes(value: string, error?: string | ValidationErrorMessage<string>): this {
        return this.asserts(
            StringAssert.includes(value), 
            error ?? `must contain value "${value}"`,
            `contains-${value}`
        )
    }
}

//// Exports ////

export {
    IsString
}

export const isString = new IsString()