import { RecordStruct } from '@benzed/immutable'
import { InputOf, namesOf, OutputOf } from '@benzed/util'

import { AnyValidatorStruct, ValidatorStruct } from '../../validator-struct'
import { ValidateInput, ValidateOptions } from '../../../validate'
import { ValidationContext } from '../../../validation-context'

import { $$settings, ValidateSettings, ValidateUpdateSettings } from '../../validate-struct'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Symbols ////

const $$main = Symbol('main-validator')

const $$sub = Symbol('sub-validators')

//// Types ////

interface SubValidator<T> extends ValidatorStruct<T, T> {
    readonly enabled?: boolean 
}

type SubValidators<T> = Record<string, SubValidator<T>>

type SchemaInput<V extends AnyValidatorStruct> = InputOf<V>

type SchemaOutput<V extends AnyValidatorStruct> = OutputOf<V> extends InputOf<V> 
    ? OutputOf<V> 
    : never

//// Main ////

/**
 * A schema houses a primary validator and an arbitary
 * number of sub validators, providing interface elements
 * for extended classes to assist in configuration.
 */
abstract class Schema<V extends AnyValidatorStruct, S extends SubValidators<SchemaOutput<V>>>
    extends ValidatorStruct<SchemaInput<V>, SchemaOutput<V>> {

    //// Constructor ////

    constructor(main: V, sub: S) {
        super()
        this[$$main] = main 
        this[$$sub] = new RecordStruct(sub) as unknown as S
    }
    
    //// ValidatorStruct Implementation ////

    validate(
        input: InputOf<V>, 
        options?: ValidateOptions
    ): SchemaOutput<V> {

        const ctx = new ValidationContext(input, options)
        
        // validate main validator
        let output = this[$$main](input, ctx)

        // validate sub validators
        for (const name of namesOf(this[$$sub])) {
            const sub = this[$$sub][name]

            // ignore if validator is disablable
            const isDisabled = sub.enabled === false
            if (isDisabled)
                continue

            output = sub(output, ctx)
        }

        return output
    }

    //// Convenience Interface ////

    protected _applySubValidator<K extends keyof S, T extends S[K]>(
        name: K,
        settings: ValidateUpdateSettings<T> | S[K]
    ): this {
        return ValidatorStruct.applySettings(
            this,
            {
                [$$sub]: {
                    [name]: settings
                }
            } as ValidateSettings<this>
        )
    }

    protected _applyMainValidator(
        settings: ValidateUpdateSettings<V> | V
    ): this {
        return ValidatorStruct.applySettings(
            this,
            { [$$main]: settings } as ValidateUpdateSettings<this>
        )
    }

    //// Settings ////

    protected readonly [$$main]: V

    protected readonly [$$sub]: S

    get [$$settings](): { [$$main]: V, [$$sub]: S } {
        return {
            [$$main]: this[$$main],
            [$$sub]: this[$$sub]
        }
    }

}

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