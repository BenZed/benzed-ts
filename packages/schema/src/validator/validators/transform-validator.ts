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

//// Types ////

type Transformers = readonly AnyValidateStruct[]

type FirstTransformer<T extends Transformers> = T extends [infer F, ...any]
    ? F extends AnyValidateStruct
        ? F 
        : never
    : never

type LastTransformer<T extends Transformers> = T extends [...any, infer L]
    ? L extends AnyValidateStruct
        ? L 
        : T extends [infer F]
            ? F extends AnyValidateStruct
                ? F
                : never
            : never
    : never

type TransformTo<T extends Transformers> = ValidateStruct<OutputOf<LastTransformer<T>>>

type TransformInput<T extends Transformers> = InputOf<FirstTransformer<T>>
type TransformOutput<T extends Transformers> = OutputOf<LastTransformer<T>> extends TransformInput<T>
    ? OutputOf<LastTransformer<T>>
    : never

type TransformsSettings<T extends Transformers> = T extends [infer T1, ...infer Tr]
    ? T1 extends AnyValidateStruct 
        ? Tr extends Transformers
            ? [ValidateSettings<T1>, ...TransformsSettings<Tr>]
            : [ValidateSettings<T1>]
        : []
    : []

type TransformSettings<T extends Transformers> = {
    transformers: TransformsSettings<T>
}

//// Main ////

class TransformValidator<T extends Transformers> 
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
    Transformers,
    TransformTo
}