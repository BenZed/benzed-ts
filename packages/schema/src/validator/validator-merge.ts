import { Pipe, Property } from '@benzed/util'

import { Validate } from './validate'
import { ValidatorSettings } from './validator'
import validatorFrom from './validator-from'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type Mergable<I, O> = Validate<I,O> | Partial<ValidatorSettings<I, O>>
type Merge<I, O> = [
    Mergable<I, O>
] | [
    Mergable<I, O>,
    ...Mergable<O, O>[],
    Mergable<O, O>
] | Mergable<any,any>[]

//// Main ////

function validatorMerge<I, O>(...input: Merge<I,O>): Validate<I,O> {

    const validators = input.map(validatorFrom)

    const validate = validators.length === 1 
        ? validators[0] 
        : Pipe.from( ...validators )

    if (validators.length > 1) {
        const name = (validators[0].name ?? 'validate')
            .replaceAll('-merged', '')

        Property.name(validate, name + '-merged')
    }

    return validate
}

//// Exports ////

export default validatorMerge

export {
    validatorMerge
}