import { assign, IndexesOf, InputOf, OutputOf, pick, Pipe } from '@benzed/util'

import { 
    $$settings, 
    AnyValidateStruct,
    ValidateStruct,
    ValidateUpdateSettings,
    ValidateSettings 
} from '../validate-struct'

import PipeValidator from './pipe-validator'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type ValidatorArray = readonly AnyValidateStruct[]

type FirstValidator<T extends ValidatorArray> = T extends [infer F, ...any]
    ? F extends AnyValidateStruct
        ? F 
        : never
    : never

type LastValidator<T extends ValidatorArray> = T extends [...any, infer L]
    ? L extends AnyValidateStruct
        ? L 
        : T extends [infer F]
            ? F extends AnyValidateStruct
                ? F
                : never
            : never
    : never

//// TYpes ////

type TransformTo<T extends ValidatorArray> = ValidateStruct<OutputOf<LastValidator<T>>>

type TransformInput<T extends ValidatorArray> = InputOf<FirstValidator<T>>
type TransformOutput<T extends ValidatorArray> = OutputOf<LastValidator<T>> extends TransformInput<T>
    ? OutputOf<LastValidator<T>>
    : never

type TransformsSettings<T extends ValidatorArray> = T extends [infer T1, ...infer Tr]
    ? T1 extends AnyValidateStruct 
        ? Tr extends ValidatorArray
            ? [ValidateSettings<T1>, ...TransformsSettings<Tr>]
            : [ValidateSettings<T1>]
        : []
    : []

type TransformSettings<T extends ValidatorArray> = {
    transformers: TransformsSettings<T>
}

//// Main ////

class TransformValidator<T extends ValidatorArray> 
    extends PipeValidator<TransformInput<T>, TransformOutput<T>>{

    constructor(...transformers: T) {

        if (transformers.length !== 1)
            throw new Error(`${TransformValidator.name} requires exactly one initial validator.`)

        // @ts-expect-error It should be spreadable? So confused.
        super(...transformers)
    }

    at<I extends IndexesOf<T>>(index: I): T[I] {
        const transformer = this.validators.at(index)
        if (!transformer)
            throw new Error(`No transformer at ${index}`)

        return transformer as T[I]
    }

    to<Tx extends TransformTo<T>>(transformer: Tx): TransformValidator<[...T, Tx]> {
        return ValidateStruct.applySettings(
            this,
            {
                transformers: [
                    ...this.transformers, 
                    transformer
                ]
            } as ValidateUpdateSettings<this>
        ) as unknown as TransformValidator<[...T, Tx]>
    }

    get transformers(): T {
        return this.validators as unknown as T
    }

    // TODO
    // removeFromEnd
    // removeFromBeginning
    // splice?

    //// Settings ////

    get [$$settings](): TransformSettings<T> {
        return pick(this, 'transformers') as unknown as TransformSettings<T>
    }

    set [$$settings](value: Partial<TransformSettings<T>>) {

        const { transformers } = value
        if (!transformers)
            return

        const validators = transformers.map((t, i) => 
            this.validators[i]
                ? ValidateStruct.applySettings(
                    this.validators[i] as AnyValidateStruct, 
                    t
                )
                : t
        )

        const validate = Pipe.from(...validators)
        assign(this, { validate })
    }

}

//// Exports ////

export default TransformValidator

export {
    TransformValidator,
    TransformInput,
    TransformOutput,
    TransformTo,

    ValidatorArray,
    LastValidator,
    FirstValidator
}