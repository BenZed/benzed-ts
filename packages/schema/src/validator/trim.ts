import { AssertValidTransformValidator, ErrorDefaultAndArgs, ErrorSettings } from './validator'

/*** Main ***/

type TrimValidatorSettings = ErrorSettings<[input: string]>

/*** Main ***/

class TrimValidator extends AssertValidTransformValidator<string, TrimValidatorSettings> {

    /*** AssertTransformEqualValidator Implementation ***/

    protected _transform(input: string): string {
        return input.trim()
    }

    protected _getErrorDefaultAndArgs(input: string): ErrorDefaultAndArgs<TrimValidatorSettings> {
        return [
            `cannot begin or end with whitespace`,
            input
        ]
    }

}

/*** Exports ***/

export default TrimValidator

export {
    TrimValidator,
    TrimValidatorSettings
}