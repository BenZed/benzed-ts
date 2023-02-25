
import { assign, defined, isFunc, isOptional, isString, isSymbol, isUnion } from '@benzed/util'
import { SignatureParser } from '@benzed/signature-parser'

import { PipeValidator, Validators } from '../pipe-validator'
import { ContractValidator } from '../contract-validator'
import { Validator } from '../../validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

// const $$id = Symbol('output-validator-id') 

//// Types ////

export class OutputValidator<O> extends ContractValidator<O, O> {
    
    readonly id?: symbol

    constructor(
        settings: OutputValidatorSettings<O>
    ) {
        super()
        assign(this, defined(settings))
    }

}

export type OutputValidatorTransform<O> = OutputValidator<O>['transform']

export type OutputValidatorPredicate<O> = OutputValidator<O>['isValid']

export type OutputValidatorMessage<O> = OutputValidator<O>['message']

export interface OutputValidatorSettings<O> extends Partial<OutputValidator<O>> {
    readonly id?: symbol
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
        message?: OutputValidatorMessage<O>,
        id?: symbol
    ): this 

    transforms(
        transform: OutputValidatorTransform<O>,
        id?: symbol
    ): this 
    transforms(
        transform: OutputValidatorTransform<O>,
        message?: OutputValidatorMessage<O>,
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

type ToMessageIdParams<O> = [message?: OutputValidatorMessage<O>, id?: symbol] | [id?: symbol]

//// PipeValidatorBuilder ////

/**
 * Pipe validator with an interface for manipulating output validators.
 */
export class PipeValidatorBuilder<I, O extends I = I> 
    extends PipeValidator<I,O>
    implements PipeValidatorBuilderMethods<O> {

    static empty<Ix,Ox extends Ix>(): PipeValidatorBuilder<Ix,Ox> {
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

        return new PipeValidatorBuilder(...validators as Validators<I,O>) as this
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

        const validators = this.validators.filter(v => !('id' in v && v.id === id)) as readonly Validator[] as Validators<I,O>
        if (validators.length === this.validators.length) {
            throw new Error(
                `Validator with given id ${String(id)} could not be found.`
            )
        }

        return new PipeValidatorBuilder(...validators) as this
    }

    //// Helper ////

}