import { assign } from '@benzed/util'

import { 
    ContractValidator, 
    ContractValidatorSettings 
} from '../contract-validator'

//// Generic ////

export class GenericValidator<I, O extends I> extends ContractValidator<I, O> {

    readonly name

    constructor(
        { 
            name = 'validator', 
            ...rest 
        }: ContractValidatorSettings<I,O>
    ) {
        super()
        assign(this, rest)
        this.name = name
    }
}