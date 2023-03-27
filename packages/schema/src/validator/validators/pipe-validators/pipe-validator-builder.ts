
import { assign, define, defined, isDefined, isFunc, isOptional, isString, isSymbol, isUnion, pick } from '@benzed/util'
import { SignatureParser } from '@benzed/signature-parser'

import { PipeValidator, Validators } from '../pipe-validator'
import { ContractValidator } from '../contract-validator'
import { Validator, ValidatorState, ValidatorStateApply } from '../../validator'
import { ValidationErrorMessage } from '../../../validation-error'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Types ////

export class OutputValidator<O> extends ContractValidator<O, O> {
    
    readonly id?: symbol

    constructor(
        settings: OutputValidatorSettings<O>
    ) {
        super()
        Validator.setState(this, defined(settings) as ValidatorStateApply<this>)
    }

    get [Validator.state](): OutputValidatorState<O> {
        return pick(this, 'name', 'transform', 'isValid', 'message', 'id')
    }

    set [Validator.state](state: OutputValidatorState<O>) {
        define.named(state.name, this)

        define.hidden(this, 'transform', state.transform)
        define.hidden(this, 'isValid', state.isValid)
        define.hidden(
            this, 
            'message', 
            isString(state.message) 
                ? () => state.message 
                : state.message
        )

        define(this, 'id', { value: state.id, enumerable: isDefined(state.id) })

    }

}

export type OutputValidatorTransform<O> = OutputValidator<O>['transform']

export type OutputValidatorPredicate<O> = OutputValidator<O>['isValid']

export type OutputValidatorState<O> = Pick<OutputValidator<O>, 'name' | 'isValid' | 'transform' | 'message' | 'id'>
export interface OutputValidatorSettings<O> extends Partial<Omit<OutputValidatorState<O>, 'message'>> {
    readonly id?: symbol
    readonly message?: ValidationErrorMessage<O>
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
        message?: ValidationErrorMessage<O>,
        id?: symbol
    ): this 

    transforms(
        transform: OutputValidatorTransform<O>,
        id?: symbol
    ): this 
    transforms(
        transform: OutputValidatorTransform<O>,
        message?: ValidationErrorMessage<O>,
        id?: symbol
    ): this 

    remove(
        id: symbol
    ): this
}

//// Helper ////

const toMessageId = new SignatureParser({
    id: isOptional(isSymbol),
    message: isOptional(isUnion(isString, isFunc))
}).addLayout('message', 'id')
    .addLayout('id')

type ToMessageIdParams<O> = [message?: ValidationErrorMessage<O>, id?: symbol] | [id?: symbol]

//// PipeValidatorBuilder ////

/**
 * Pipe validator with an interface for manipulating output validators.
 */
export class PipeValidatorBuilder<I, O = I> 
    extends PipeValidator<I,O>
    implements PipeValidatorBuilderMethods<O> {

    static empty<Ix, Ox>(): PipeValidatorBuilder<Ix,Ox> {
        return new PipeValidatorBuilder(...[] as unknown as Validators<Ix,Ox>)
    }

    readonly validators: Validators<I,O>

    constructor(...validators: Validators<I,O>) {
        super()
        this.validators = validators
    }

    validates(
        input: OutputValidatorSettings<O> | Validator<O>,
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
            : [...this.validators, validator] as const

        return Validator.applyState(this, { validators } as ValidatorState<this>)
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

        const validators = this
            .validators
            .filter(v => !('id' in v && v.id === id)) as readonly Validator[] as Validators<I,O>
        if (validators.length === this.validators.length) {
            throw new Error(
                `Validator with given id ${String(id)} could not be found.`
            )
        }

        return Validator.applyState(this, { validators } as ValidatorState<this>)
    }

    //// Helper ////

    get [Validator.state](): Pick<this, 'validators'> {
        return pick(this, 'validators')
    }

}
