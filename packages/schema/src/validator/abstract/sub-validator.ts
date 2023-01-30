
import { 
    assign, 
    defined, 
    isOptional, 
    isString, 
    isSymbol,
    SignatureParser 
} from '@benzed/util'

import { 
    isValidationErrorInput, 
    ValidationErrorInput 
} from '../validate-error'

import AbstractValidator from './abstract-validator'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper ////

const toNameErrorId = new SignatureParser({
    name: isOptional(isString),
    error: isOptional(isValidationErrorInput<any>),
    id: isOptional(isSymbol)
}).addLayout('error', 'name', 'id')
    .addLayout('error', 'id')
    .addLayout('id')

type NameErrorId<T> = { error?: ValidationErrorInput<T>, name?: string, id?: symbol }

type NameErrorIdSignature<T> = 
    [ settings: NameErrorId<T> ] |
    [ error?: ValidationErrorInput<T>, name?: string, id?: symbol ] | 
    [ error?: ValidationErrorInput<T>, id?: symbol ] | 
    [ id?: symbol ]

//// Main ////

abstract class SubValidator<T> extends AbstractValidator<T,T> {

    constructor(...args: NameErrorIdSignature<T>) {

        const { error, name, id } = toNameErrorId(...args) ?? {}

        super(id)

        assign(
            this, 
            defined({ 
                name,
                error: isString(error) ? () => error : error 
            })
        )
    }
}

//// Exports ////

export default SubValidator

export {
    SubValidator,
    toNameErrorId,
    NameErrorId,
    NameErrorIdSignature
}