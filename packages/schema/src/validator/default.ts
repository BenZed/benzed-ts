import { is } from '@benzed/is'
import { copy } from '@benzed/immutable'

import { TransformValidator } from './validator'

//// Types ////

interface DefaultValidatorSettings<O> {

    /**
     * Get the default value
     */
    readonly default?: O | (() => O)

}

//// Exports ////

class DefaultValidator<O> extends TransformValidator<
/**/ unknown,
/**/ O,
/**/ DefaultValidatorSettings<O>
> {

    transform(input: unknown): O | undefined {
        return this._transform(input) as O | undefined
    }

    //// TransformValidator Implementation ////

    protected _transform(input: unknown): O | unknown {

        const { default: _default } = this.settings

        const output = input === undefined
            ? is.function(_default)
                ? _default()
                : copy(_default)
            : input

        return output
    }

}

//// Exports ////

export default DefaultValidator

export {
    DefaultValidator,
    DefaultValidatorSettings
}