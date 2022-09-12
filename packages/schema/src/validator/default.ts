import { isFunction } from '@benzed/is'
import { copy } from '@benzed/immutable'

import { TransformValidator } from './validator'

/*** Types ***/

interface DefaultValidatorSettings<O> {

    /**
     * Get the default value
     */
    readonly default?: O | (() => O)

}

/*** Exports ***/

class DefaultValidator<O> extends TransformValidator<
/**/ unknown,
/**/ O,
/**/ DefaultValidatorSettings<O>
> {

    public transform(input: unknown): O | undefined {
        return this._transform(input) as O | undefined
    }

    /*** TransformValidator Implementation ***/

    protected _transform(input: unknown): O | unknown {

        const { default: _default } = this.settings

        const output = input === undefined
            ? isFunction(_default)
                ? _default()
                : copy(_default)
            : input

        return output
    }

}

/*** Exports ***/

export default DefaultValidator

export {
    DefaultValidator,
    DefaultValidatorSettings
}