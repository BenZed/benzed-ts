
import { DuplexValidator, ErrorSettings } from './validator'

/*** Types ***/

interface TypeValidatorSettings<T> extends ErrorSettings<[value: unknown, typeName: string]> {

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

}

/*** Main ***/

class TypeValidator<O> extends DuplexValidator<
/**/ unknown,
/**/ O,
/**/ TypeValidatorSettings<O>
> {

    public constructor (settings: TypeValidatorSettings<O>) {
        super({
            ...settings
        })
    }

    /*** DuplexValidator Implementation ***/

    public transform(input: unknown): unknown | O {

        const { is, cast } = this.settings

        const output = is(input) || !cast
            ? input
            : cast(input)

        return output
    }

    public assert(input: unknown): asserts input is O {

        const { is, name } = this.settings

        if (!is(input)) {
            this._throwWithErrorSetting(
                `${String(input)} is not ${name}`,
                input,
                name
            )
        }
    }

}

/*** Exports ***/

export default TypeValidator

export {
    TypeValidator,
    TypeValidatorSettings
}