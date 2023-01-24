import { isFunc, Pipe, Property } from '@benzed/util'

import Validate from './validate'
import Validator, { ValidatorSettings } from './validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type Mergable<I, O> = Validate<I,O> | Partial<ValidatorSettings<I, O>> 
type Merge<I, O> = [
    Mergable<I, O>
] | [
    Mergable<I, any>,
    ...Mergable<any, any>[],
    Mergable<any, O>
]

//// Main ////

function validatorMerge<I, O>(...input: Merge<I,O>): Validate<I,O> {

    const validators = input.map(v => isFunc<Validate<unknown>>(v) 
        ? v 
        : new Validator(v as ValidatorSettings<unknown>))
    
    const validate = validators.length === 1 
        ? validators[0] 
        : Pipe.from( ...validators)

    if (validators.length > 1) {
        const name = (validators[0].name ?? 'validate').replaceAll('-merged', '')
        Property.name(validate, name + '-merged')
    }

    return validate as Validate<I, O>
}

//// Exports ////

export default validatorMerge

export {
    validatorMerge
}