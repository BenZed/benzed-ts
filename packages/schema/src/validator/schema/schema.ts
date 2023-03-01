import { RecordStruct, StructStateApply, Structural } from '@benzed/immutable'
import { assign, each, pick } from '@benzed/util'

import { ValidateInput, ValidateOutput } from '../../validate'
import ValidationContext from '../../validation-context'
import { Validator } from '../validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Symbols ////

const $$main = Symbol('main-validator')

const $$sub = Symbol('sub-validators')

//// Types ////

interface SubValidator<T> extends Validator<T, T> { 
    readonly enabled?: boolean 
}

type SubValidators<V extends Validator> = Record<string, SubValidator<ValidateOutput<V>>>

//// Main ////

/**
 * A schema houses a primary validator and an arbitary
 * number of sub validators, providing interface elements
 * for extended classes to assist in configuration.
 */
abstract class Schema<V extends Validator, S extends SubValidators<V>> extends Validator<ValidateInput<V>, ValidateOutput<V>> {

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
            if (ctx.hasError() || ctx.hasSubContextError())
                break

            const sub = this[$$sub][name]

            // ignore if validator is disablable
            const isDisabled = sub.enabled === false
            if (isDisabled)
                continue

            ctx = sub[Validator.analyze](ctx as ValidationContext) as ValidationContext
        }

        return ctx
    }

    //// Settings ////

    readonly [$$main]: V

    readonly [$$sub]: S

    //// Convenience Interface ////

    protected _applySubValidator<K extends keyof S, T extends S[K]>(
        name: K,
        state: T | StructStateApply<T>
    ): this {
        return Structural.create(
            this,
            $$sub,
            name,
            state as any
        )
    }

    protected _applyMainValidator(
        state: V | StructStateApply<V>
    ): this {

        return Structural.create(
            this,
            $$main,
            state as any
        )
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
    SubValidator,
    SubValidators,

    $$main,
    $$sub
}