
import { isFunction } from '@benzed/is/lib'
import { RequirePartial } from '@benzed/util'
import { DuplexValidator } from './validator'

/*** Types ***/

interface TypeValidatorSettings<T> {

    /**
     * Type guard for the given type.
     */
    readonly is: (input: unknown) => input is T

    /**
     * Method to attempt to cast inputs with mismatched types to the desired type.
     */
    readonly cast?: (input: unknown) => T | unknown

    /**
     * Name of the type, for errors.
     */
    readonly name: string

    /**
     * Overrides the default TypeValidationError message
     */
    readonly error?: string | ((value: unknown, name: string) => string)

}

type TypeValidatorSettingsWithError<O> =
    RequirePartial<
    /**/ TypeValidatorSettings<O>,
    /**/ 'error'
    >

/*** Main ***/

class TypeValidator<O> extends DuplexValidator<
/**/ unknown,
/**/ O,
/**/ TypeValidatorSettingsWithError<O>
> {

    public transform(input: unknown): unknown | O {

        const { is, cast } = this.settings

        const output = is(input) || !cast
            ? input
            : cast(input)

        return output
    }

    public assert(input: unknown): asserts input is O {

        const { is, error, name } = this.settings

        if (is(input))
            return

        throw new Error(
            isFunction(error)
                ? error(input, name)
                : error
        )
    }

    public constructor (settings: TypeValidatorSettings<O>) {
        super({
            error: (value, name) => `${String(value)} is not type ${name}`,
            ...settings
        })
    }

}

/*** Exports ***/

export default TypeValidator

export {
    TypeValidator,
    TypeValidatorSettings
}