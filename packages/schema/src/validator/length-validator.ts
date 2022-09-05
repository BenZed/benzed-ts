import RangeValidator, { RangeValidatorSettings } from './range-validator'
import { AssertValidator } from './validator'

/*** Types ***/

type LengthValidatorSettings = RangeValidatorSettings

/*** Main ***/

class LengthValidator<O extends ArrayLike<unknown>>

    extends AssertValidator<O, O, LengthValidatorSettings> {

    private readonly _rangeValidator: RangeValidator<number>

    public constructor (settings: LengthValidatorSettings) {
        super({
            error: (_input, lengthTransgressionDetail) =>
                `length must be ${lengthTransgressionDetail}`,
            ...settings
        })

        this._rangeValidator = new RangeValidator(this.settings)
    }

    public override applySettings(settings: object): this {
        super.applySettings(settings)
        this._rangeValidator.applySettings(this.settings)
        return this
    }

    public assert(input: O): void {
        this._rangeValidator.assert(input.length)
    }

}

/*** Exports ***/

export default LengthValidator

export {
    LengthValidator,
    LengthValidatorSettings
}