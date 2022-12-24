
import { isFunc, isObject } from '@benzed/util'

//// Types ////

export interface Validateable {
    validate(): void 
}

export function isValidateable(input: unknown): input is Validateable {
    return isObject(input) && 
    'validate' in input && 
    isFunc(input.validate) && 
    input.validate.length === 0
}

//// Exports ////
