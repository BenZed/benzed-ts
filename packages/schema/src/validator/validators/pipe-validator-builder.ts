
import { assign, defined, isFunc, isOptional, isSymbol, pick, Pipe, SignatureParser } from '@benzed/util'
import { AnyValidate } from '../../validate'

import { isValidationErrorMessage, ValidationErrorMessage } from '../../validation-error'
import { ContractValidator } from '../contract-validator'

import { $$settings, ValidateUpdateSettings } from '../validate-struct'
import { ValidatorStruct } from '../validator-struct'

import { PipeValidator, Validators } from './pipe-validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

// const $$id = Symbol('output-validator-id') 

//// Types ////

export type OutputValidatorTransform<O> = ContractValidator<O, O>['transform']

export type OutputValidatorPredicate<O> = ContractValidator<O, O>['isValid']

export interface OutputValidatorSettings<O> extends Partial<ContractValidator<O, O>> {
    readonly message?: string | ValidationErrorMessage<O>
    readonly id?: symbol
}

export class OutputValidator<O> extends ContractValidator<O, O> {
    
    readonly id?: symbol

    constructor(
        settings: OutputValidatorSettings<O>
    ) {
        super()
        assign(this, defined(settings))
    }

}

export interface PipeValidatorBuilderMethods<O> {

    validates(validator: OutputValidator<O>): this
    validates(settings: OutputValidatorSettings<O>): this
    validates<T extends OutputValidatorSettings<O>>(validator: T): this

    asserts(
        isValid: OutputValidatorPredicate<O>,
        id?: symbol
    ): this 

    asserts(
        isValid: OutputValidatorPredicate<O>,
        message?: string | ValidationErrorMessage<O>,
        id?: symbol
    ): this 

    transforms(
        transform: OutputValidatorTransform<O>,
        id?: symbol
    ): this 
    transforms(
        transform: OutputValidatorTransform<O>,
        message?: string | ValidationErrorMessage<O>,
        id?: symbol
    ): this 

    remove(
        id: symbol
    ): this
}

//// Helper ////

const toMessageId = new SignatureParser({
    id: isOptional(isSymbol),
    message: isOptional(isValidationErrorMessage<any>)
}).addLayout('message', 'id')
    .addLayout('id')

type ToMessageIdParams<O> = [message?: string | ValidationErrorMessage<O>, id?: symbol] | [id?: symbol]

//// PipeValidatorBuilder ////

/**
 * Pipe validator with an interface for manipulating output validators.
 */
export class PipeValidatorBuilder<I, O extends I = I> 
    extends PipeValidator<I,O>
    implements PipeValidatorBuilderMethods<O> {

    static empty<Ix,Ox extends Ix>(): PipeValidatorBuilder<Ix,Ox> {
        return new PipeValidatorBuilder(...[] as AnyValidate[] as Validators<Ix,Ox>)
    }

    validates(
        input: OutputValidatorSettings<O> | OutputValidator<O>,
        id?: symbol
    ): this {

        const validator = isFunc(input)
            ? input 
            : new OutputValidator(input)

        if (id) 
            assign(validator, { id })

        const index = this.validators.findIndex(v => id && 'id' in v && v.id === id)

        const validators = index > 0 
            ? this.validators.map((v, i) => i === index ? validator : v)
            : [...this.validators, validator]

        return this._applyPipeValidators(validators as Validators<I,O>)
    }

    asserts(
        isValid: OutputValidatorPredicate<O>,
        ...args: ToMessageIdParams<O>
    ): this {
        const { message, id } = toMessageId(...args) ?? {}
        return this.validates({ isValid, message }, id)
    }

    transforms(
        transform: OutputValidatorTransform<O>,
        ...args: ToMessageIdParams<O>
    ): this {
        const { message, id } = toMessageId(...args) ?? {}
        return this.validates({ transform, message }, id)
    }

    remove(
        id: symbol
    ): this {

        const validators = this.validators.filter(v => !('id' in v && v.id === id))
        if (validators.length === this.validators.length) {
            throw new Error(
                `Validator with given id ${String(id)} could not be found.`
            )
        }

        return this._applyPipeValidators(validators as Validators<I,O>)
    }

    //// Helper ////
    
    protected _applyPipeValidators(
        validators: Validators<I,O>
    ): this {
    
        const validate = Pipe.from(...validators)
    
        return ValidatorStruct.applySettings(
            this,
            { validate } as ValidateUpdateSettings<this>
        )
    }

    //// Settings ////

    get [$$settings](): Pick<this, 'validate'> {
        return pick(this, 'validate')
    }
}
