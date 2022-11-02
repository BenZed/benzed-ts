
import { AssertTransformValidator, ErrorSettings } from './validator'

//// Types ////

interface TypeValidatorSettings<T> extends ErrorSettings<[
    value: unknown, 
    typeName: string, 
    typeArticle: string | undefined
]> {

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
     * Article of the type, for errors. Defaults to "a"
     * 
     * Eg: `must be a string`
     */
    readonly article?: string
}

//// Main ////

class TypeValidator<O> extends AssertTransformValidator<
/**/ unknown,
/**/ O,
/**/ TypeValidatorSettings<O>
> {

    //// AssertTransformValidator Implementation ////

    protected _transform(input: unknown): unknown | O {

        const { is, cast } = this.settings

        const output = !is(input) && cast
            ? cast(input)
            : input

        return output
    }

    protected _assert(input: unknown): asserts input is O {

        const { is, name, article } = this.settings

        if (!is(input)) {
            this._throwWithErrorSetting(
                `must be ${article ? article + ' ' + name : name}`,
                input,
                name,
                article
            )
        }
    }

}

//// Exports ////

export default TypeValidator

export {
    TypeValidator,
    TypeValidatorSettings
}