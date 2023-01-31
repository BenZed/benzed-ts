import { equals } from '@benzed/immutable'
import { assign, KeysOf, omit } from '@benzed/util/src'
import { ValidateOptions } from '../validate'
import ValidationContext from '../validation-context'
import ValidationError from '../validation-error'
import { ValidateState, ValidatorStruct } from './validator'

//// Types ////

type ContractValidatorSettings<I, O extends I> = Partial<{
    [K in KeysOf<ContractValidator<I,O>>]: ContractValidator<I,O>[K]
}>

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
     * Create a new validator by providing settings to manually override one or many
     * of the contract validators properties.
     */
    static generic<Ix,Ox extends Ix>({ name: _name = 'validator', ...settings }: ContractValidatorSettings<Ix,Ox>): ContractValidator<Ix,Ox> {
        return new class extends ContractValidator<Ix,Ox> {
            constructor(readonly name = _name) {
                super()
                assign(this, settings)
            }
        }

    }

    /**
     * Should have something to do with the output type.
     */
    abstract override get name(): string
    
    /**
     * Given an invalid input and a context object,
     * receive an error message to be put in a validation error.
     */
    error(input: I, context: ValidationContext<I>): string {
        void input 
        void context
        return `${this.name} validation failed.`
    }

    /**
     * Method that attempts to partially or completely change it's input
     * into it's desired output, if it isn't already. Should never throw 
     * any errors.
     * 
     * TODO: make this optionally asyncronous
     */
    transform(input: I | O, context: ValidationContext<I>): I | O {
        void context
        return input
    }

    /**
     * Method determines if a given input is valid
     */
    isValid(value: I | O, context: ValidationContext<I>): value is O {
        /**
         * By default, a output is considered valid if it is equal
         * to it's transformed input.
         * 
         * This default logic allows for extended implementations
         * to acheive the validation trifecta by only extending the
         * transform method.
         */
        return this.equal(value, context.transformed)
    }

    /**
     * Logic for determining if an input is equal to it's output and
     * vise versa, so overridden implementations should be transitive.
     *
     * This defaults to a deep equality check according to the
     * default @benzed/immutable $$equals algorithm.
     *
     * TODO: said algorithm needs an update
     */
    equal<T extends I | O>(input: I | O, output: T): input is T {
        return equals(input, output)
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
            ? input 
            : ctx.transformed
            
        if (!this.isValid(output, ctx)) {
            throw new ValidationError(
                this.error(input, ctx), 
                ctx
            )
        }
    
        return output
    }

    /**
     * The validate method should never need to change, as it's logic will be based
     * on the configuration of the rest of the properties of the validator.
     */
    protected override [ValidatorStruct.$$assign](state: ValidateState<this>): ValidateState<this> {
        return omit(state, 'validate')
    }
        
}

//// Exports ////

export default ContractValidator

export {
    ContractValidator,
    ContractValidatorSettings
}