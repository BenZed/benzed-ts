
import ValidationContext from '../validation-context'
import { ContractValidatorSettings } from './contract-validator'
import PipeValidator, { SubValidator } from './pipe-validator'

//// Types ////

export type SubContractValidatorOutputError<O> = string | NonNullable<ContractValidatorSettings<O,O>['error']> 

export type SubContractValidatorTransform<O> = NonNullable<ContractValidatorSettings<O, O>['transform']>

export type SubContractValidatorPredicate<O> = (input: O, context: ValidationContext<O>) => boolean

export interface SubContractValidatorSettings<O> extends Omit<ContractValidatorSettings<O, O>, 'isValid' | 'error'> {

    isValid: SubContractValidatorPredicate<O>
    error?: SubContractValidatorOutputError<O>
}

//// PipeValidatorBuilder ////

/**
 * Pipe validator with a convenience interface for adding applicable validators.
 */
export abstract class PipeValidatorBuilder<I, O extends I = I> extends PipeValidator<I,O> {

    abstract validates(
        validator: SubValidator<O>
    ): this
    abstract validates(
        settings: SubContractValidatorSettings<O>
    ): this

    abstract asserts(
        isValid: SubContractValidatorPredicate<O>,
        error?: string | SubContractValidatorOutputError<O>,
        name?: string // | symbol
    ): this 

    abstract transforms(
        transform: SubContractValidatorTransform<O>,
        error?: string | SubContractValidatorOutputError<O>,
        name?: string // | symbol
    ): this 

    // abstract remove(
    //     id: symbol
    // ): this
}
