
import { ValidateOptions } from '../validate'
import { ValidationContext } from '../validation-context'
import { ValidationError } from '../validation-error'
import { ValidatorStruct } from './validator-struct'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Main //// 

/**
 * A versatile implementation of the validate contract.
 * At least one method would need to be overrided for the validator to actually 
 * do anything, because with it's default configuration any input is considered 
 * valid, so it's marked as abstract despite that it has no relevent abstract 
 * methods.
 * 
 */
abstract class ContractValidator<I, O extends I> extends ValidatorStruct<I,O> {

    /**
     * Method that attempts to partially or completely change it's input
     * into it's desired output. Should never throw any errors.
     */
    transform(input: I | O, context: ValidationContext<I>): I | O {
        void context
        return input
    }

    /**
     * Method determines if a given input is valid
     */
    isValid(value: I | O, context: ValidationContext<I>): boolean {

        /**
         * By default, a output is considered valid if it is equal
         * to it's transformed input.
         *  
         * This default logic allows for extended implementations
         * to acheive the validation trifecta by only extending the
         * transform method.
         */
        return ValidatorStruct.equal(value, context.transformed)
    }

    /**
     * Implementation of the validate contract.
     */
    validate(
        input: I, 
        options?: Partial<ValidateOptions>
    ): O {
        
        const ctx = new ValidationContext(input, options)
        
        ctx.transformed = this.transform(input, ctx)
    
        const output = ctx.transform 
            ? ctx.transformed
            : input

        if (!this.isValid(output, ctx)) {
            throw new ValidationError(
                this,
                ctx
            )
        }

        return output as O
    }
}

//// Exports ////

export default ContractValidator

export type AnyContractValidator = ContractValidator<any,any>

export {
    ContractValidator
}