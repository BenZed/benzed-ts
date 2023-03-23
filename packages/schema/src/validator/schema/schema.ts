import { RecordStruct } from '@benzed/immutable'
import { assign, each, isString, pick } from '@benzed/util'

import { ValidateInput, ValidateOutput } from '../../validate'
import ValidationContext from '../../validation-context'
import { ValidationErrorMessage } from '../../validation-error'
import { Validator, ValidatorStateApply } from '../validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Symbols ////

const $$main = Symbol('main-validator')

const $$sub = Symbol('sub-validators')

//// Types ////

interface SubValidator<T> extends Validator<T, T> { 
    readonly enabled: boolean 
}

type SubValidators<V extends Validator> = Record<string, SubValidator<ValidateOutput<V>>>

type SchemaMainStateApply<V extends Validator> = {
    [K in keyof ValidatorStateApply<V>]: K extends 'message'
        ? ValidationErrorMessage<ValidateInput<V>, ValidateOutput<V>>
        : ValidatorStateApply<V>[K]
}

//// Main ////

/**
 * A schema houses a primary validator and an arbitrary
 * number of sub validators, providing interface elements
 * for extended classes to assist in configuration.
 */
abstract class Schema<V extends Validator, S extends SubValidators<V>> extends Validator<ValidateInput<V>, ValidateOutput<V>> {

    static readonly main: typeof $$main = $$main
    static readonly sub: typeof $$sub = $$sub

    //// Constructor ////

    constructor(main: V, sub: S) {
        super()
        this[$$main] = main 
        this[$$sub] = new RecordStruct(sub) as unknown as S
    }

    override get name(): string {
        return this[$$main]?.name ?? this.constructor.name
    }
    
    //// Validator Implementation ////

    [Validator.analyze](
        ctx: ValidationContext<ValidateInput<V>, ValidateOutput<V>>
    ): ValidationContext<ValidateInput<V>, ValidateOutput<V>> {

        // validate main validator
        ctx = this[$$main][Validator.analyze](ctx)

        // validate sub validators
        for (const name of each.nameOf(this[$$sub])) {
            if (!ctx.hasValidOutput())
                break

            const sub = this[$$sub][name]
            if (!Validator.is(sub))
                continue

            // ignore if validator is disable-able
            const isDisabled = sub.enabled === false
            if (isDisabled)
                continue

            ctx = sub[Validator.analyze](ctx.pipeContext()) as ValidationContext
        }

        return ctx
    }

    //// Settings ////

    readonly [$$main]: V

    readonly [$$sub]: S

    //// Convenience Interface ////

    protected _applySubValidator<K extends keyof S, T extends S[K]>(
        name: K,
        state: T | SchemaMainStateApply<T>
    ): this {

        return Validator.applyState(
            this,
            $$sub,
            name,
            this._checkStateMessage(state) as any
        )
    }

    protected _applyMainValidator(
        state: V | SchemaMainStateApply<V>
    ): this {

        return Validator.applyState(
            this,
            $$main,
            this._checkStateMessage(state) as any
        )
    }

    // Convert a string message into a message function
    private _checkStateMessage(
        input: object
    ): object {
        
        if ('message' in input && isString(input.message)) {
            const { message } = input
            input.message = () => message
        }
        
        return input
    }

    //// Structural ////

    get [Validator.state](): { [$$main]: V, [$$sub]: S } {
        return pick(this, $$main, $$sub)
    }

    set [Validator.state](state: { [$$main]: V, [$$sub]: S }) {
        assign(this, state)
    }

} 

//// Exports ////

export default Schema

export {

    Schema,
    SchemaMainStateApply,
    SubValidator,
    SubValidators,

    $$main,
    $$sub
}