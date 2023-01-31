
import ValidationContext from '../validation-context'
import { ContractValidatorSettings } from './contract-validator'
import PipeValidator, { OutputValidator } from './pipe-validator'

//// Types ////

export type OutputContractValidatorOutputError<O> = string | NonNullable<ContractValidatorSettings<O,O>['error']> 

export type OutputContractValidatorTransform<O> = NonNullable<ContractValidatorSettings<O, O>['transform']>

export type OutputContractValidatorPredicate<O> = (input: O, context: ValidationContext<O>) => boolean

export interface OutputContractValidatorSettings<O> extends Omit<ContractValidatorSettings<O, O>, 'isValid' | 'error'> {

    isValid: OutputContractValidatorPredicate<O>
    error?: OutputContractValidatorOutputError<O>
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
        error?: string | OutputContractValidatorOutputError<O>,
        name?: string // | symbol
    ): this 

    abstract transforms(
        transform: OutputContractValidatorTransform<O>,
        error?: string | OutputContractValidatorOutputError<O>,
        name?: string // | symbol
    ): this 

    // abstract remove(
    //     id: symbol
    // ): this
}
