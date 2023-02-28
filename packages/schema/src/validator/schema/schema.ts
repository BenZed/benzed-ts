import { RecordStruct, StructStateApply, Structural } from '@benzed/immutable'
import { Trait } from '@benzed/traits'
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

type SubValidators<V extends Validator> = Record<string, SubValidator<SchemaOutput<V>>>

type SchemaInput<V extends Validator> = ValidateInput<V> 

type SchemaOutput<V extends Validator> = ValidateOutput<V> extends ValidateInput<V> 
    ? ValidateOutput<V> 
    : never

//// Main ////

declare class Schematic<V extends Validator, S extends SubValidators<V>> extends Validator<SchemaInput<V>, SchemaOutput<V>> {

    override get name(): string

    readonly [$$main]: V

    readonly [$$sub]: S
    
    [Validator.analyze](
        ctx: ValidationContext<SchemaInput<V>, SchemaOutput<V>>
    ): ValidationContext<SchemaInput<V>, SchemaOutput<V>>

    protected _applySubValidator<K extends keyof S, T extends S[K]>(
        name: K,
        state: T | (T extends Structural ? StructStateApply<T> : never)
    ): this

    protected _applyMainValidator(
        state: V | (V extends Structural ? StructStateApply<V> : never)
    ): this
}

interface Schema<V extends Validator, S extends SubValidators<V>> extends Schematic<V,S>, Structural {

    get [Structural.state](): { [$$main]: V, [$$sub]: S } 

    set [Structural.state](state: { [$$main]: V, [$$sub]: S })

}

type SchemaConstructor = abstract new <V extends Validator, S extends SubValidators<V>>(main: V, sub: S) => Schema<V,S>

/**
 * A schema houses a primary validator and an arbitary
 * number of sub validators, providing interface elements
 * for extended classes to assist in configuration.
 */
const Schema = class extends Trait.add(Validator, Structural) {

    //// Constructor ////

    constructor(main: Validator, sub: SubValidators<Validator>) {
        super()
        this[$$main] = main 
        this[$$sub] = new RecordStruct(sub) 
    }

    override get name(): string {
        return this[$$main]?.name ?? this.constructor.name
    }
    
    //// Validator Implementation ////

    [Validator.analyze](ctx: ValidationContext) {
        
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

            ctx = sub[Validator.analyze](ctx as ValidationContext)
        }

        return ctx
    }

    //// Settings ////

    readonly [$$main]: Validator

    readonly [$$sub]: SubValidators<Validator>

    //// Convenience Interface ////

    protected _applySubValidator(
        name: string,
        state: object
    ): this {
        return Structural.create(
            this,
            $$sub,
            name,
            state as any
        )
    }

    protected _applyMainValidator(
        state: object
    ): this {

        return Structural.create(
            this,
            $$main,
            state as any
        )
    }

    //// Structural ////

    get [Structural.state](): { [$$main]: Validator, [$$sub]: SubValidators<Validator> } {
        return pick(this, $$main, $$sub)
    }

    set [Structural.state](state: { [$$main]: Validator, [$$sub]: SubValidators<Validator> }) {
        assign(this, state)
    }

} as unknown as SchemaConstructor

//// Exports ////

export default Schema

export {

    Schema,
    SchemaInput,
    SchemaOutput,
    SubValidator,
    SubValidators,

    $$main,
    $$sub
}