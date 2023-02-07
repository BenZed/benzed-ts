
import { ValidationContext } from '../../validation-context'
import { ValidationErrorMessage } from '../../validation-error'
import { ContractValidator } from '../contract-validator'
import { PipeValidator, OutputValidator } from './pipe-validator'

//// Types ////

export type OutputContractValidatorTransform<O> = NonNullable<ContractValidator<O, O>['transform']>

export type OutputContractValidatorPredicate<O> = (input: O, context: ValidationContext<O>) => boolean

export interface OutputContractValidatorSettings<O> extends Omit<Partial<ContractValidator<O, O>>, 'isValid' | 'error'> {

    isValid: OutputContractValidatorPredicate<O>
    message?: string | ValidationErrorMessage<O>
}

//// PipeValidatorBuilder ////

/**
 * Pipe validator with an interface for manipulating output validators.
 */
export abstract class PipeValidatorBuilder<I, O extends I = I> extends PipeValidator<I,O> {

    abstract validates(
        validator: OutputValidator<O>
    ): this

    abstract validates(
        settings: OutputContractValidatorSettings<O>
    ): this

    abstract asserts(
        isValid: OutputContractValidatorPredicate<O>,
        message?: string | ValidationErrorMessage<O>,
        name?: string // | symbol
    ): this 

    abstract transforms(
        transform: OutputContractValidatorTransform<O>,
        message?: string | ValidationErrorMessage<O>,
        name?: string // | symbol
    ): this 

    // abstract remove(
    //     id: symbol
    // ): this
}
