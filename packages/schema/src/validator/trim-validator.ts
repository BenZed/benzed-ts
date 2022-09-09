import { AssertTransformValidator, ErrorSettings } from './validator'

/*** Main ***/

type TrimValidatorSettings = ErrorSettings<[input: string]>

/*** Main ***/

class TrimValidator extends AssertTransformValidator<string, string, TrimValidatorSettings> {

    /*** DuplexValidator Implementation ***/

    protected transform(input: string): string {
        return input.trim()
    }

    protected assert(input: string): void {
        if (input !== this.transform(input)) {
            this._throwWithErrorSetting(
                'cannot begin or end with whitespace',
                input
            )
        }
    }

}

/*** Exports ***/

export default TrimValidator

export {
    TrimValidator,
    TrimValidatorSettings
}