import { capitalize } from '@benzed/string'
import { isString } from '@benzed/util'

import { ValidationErrorMessage } from '../../../validator'

import IsPrimitive from './is-primitive'

//// Symbols ////

const $$trim = Symbol('trim-validator')
const $$case = Symbol('case-validator')
const $$start = Symbol('starts-with-validator')
const $$end = Symbol('ends-with-validator')

//// Boolean ////

class IsString extends IsPrimitive<string> {

    constructor() {
        super({
            type: 'string',
            is: isString
        }) 
    }

    get trim(): this {
        return this.transforms(
            i => i.trim(),
            'must not begin or end with whitespace',
            $$trim
        )
    }

    get upperCase(): this {
        return this.transforms(
            i => i.toUpperCase(),
            'must be upper cased',
            $$case
        )
    }

    get lowerCase(): this {
        return this.transforms(
            i => i.toLowerCase(),
            'must be lower cased',
            $$case
        )
    }

    get capitalize(): this {
        return this.transforms(
            capitalize,
            'must be capitalized',
            $$case
        )
    }

    startsWith(start: string, error?: string | ValidationErrorMessage<string>): this {
        return this.transforms(
            i => i.startsWith(start) ? i : start + i, 
            error ?? `must start with "${start}"`,
            $$start
        )
    }

    endsWith(end: string, error?: string | ValidationErrorMessage<string>): this {
        return this.transforms(
            i => i.endsWith(end) ? i : i + end, 
            error ?? `must end with "${end}"`,
            $$end
        )
    }

    includes(value: string, error?: string | ValidationErrorMessage<string>): this {
        return this.asserts(
            i => i.includes(value), 
            error ?? `must contain value "${value}"`,
            `contains-${value}`
        )
    }
}

//// Exports ////

export {
    IsString
}