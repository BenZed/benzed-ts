import { CallableStruct } from '@benzed/immutable'
import { 
    assign, 
    defined, 
    isOptional,
    isString, 
    isSymbol, 
    nil, 
     
    Property, 
    SignatureParser 
} from '@benzed/util'

import { $$id, defineSymbol } from '../../util/symbols'

import type {Validate} from '../validate'
import { isValidationErrorInput, ValidationErrorInput } from '../validate-error'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type NameErrorId<T> = { error?: ValidationErrorInput<T>, name?: string, id?: symbol }

type NameErrorIdSignature<T> = 
    [ settings: NameErrorId<T> ] |
    [ error?: ValidationErrorInput<T>, name?: string, id?: symbol ] | 
    [ error?: ValidationErrorInput<T>, id?: symbol ] | 
    [ id?: symbol ]
    
//// Helpers ////

const toNameErrorId = new SignatureParser({
    name: isOptional(isString),
    error: isOptional(isValidationErrorInput<any>),
    id: isOptional(isSymbol)
}).addLayout('error', 'name', 'id')
    .addLayout('error', 'id')
    .addLayout('id')

function setName(object: object, name: string | nil): void {

    if (!name) {
        name = object.constructor.name
        name = name
            .charAt(0)
            .toLowerCase() + name.slice(1)
    }

    Property.name(object, name)
}

function setError<T>(
    object: object,
    error: ValidationErrorInput<T> | nil
): void {

    assign(
        object, 
        defined({ 
            error: isString(error) ? () => error : error 
        })
    )

}

function setId(object: object, id: symbol | nil): void {
    // id, if provided
    if (id)
        defineSymbol(object, $$id, id)
}

//// Exports ////

export abstract class AbstractValidate<I,O> extends CallableStruct<Validate<I,O>> {
    
    constructor(validate: Validate<I,O>, ...args: NameErrorIdSignature<I>) {

        super(validate)

        const { name, error, id } = toNameErrorId(...args) ?? {}

        setName(this, name)
        setError(this, error)
        setId(this, id)
    }

    error(): string {
        return 'Validation failed.'
    }

}

export {
    toNameErrorId,
    NameErrorId,
    NameErrorIdSignature
}