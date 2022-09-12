import { isString } from '@benzed/is'
import {
    capitalize,
    toCamelCase,
    toDashCase
} from '@benzed/string'

import {
    AssertTransformEqualValidator,
    ErrorDefault,
    ErrorDefaultAndArgs,
    ErrorSettings
} from './validator'

/*** Types ***/

interface CaseValidatorSettings<C extends Casing = Casing>
    extends ErrorSettings<[input: string, casing: C]> {

    case: C
    delimiter?: Delimiter<C>

}

type Delimiter<C extends Casing> = C extends 'camel' | 'pascal'
/**/ ? string | RegExp
/**/ : C extends 'dash'
    /**/ ? string
    /**/ : never

type Casing =
    'upper' |
    'lower' |
    'capital' |
    'dash' |
    'snake' |
    'camel' |
    'pascal'

type CaseValidatorSettingsShortcut<C extends Casing> = [
    casing: C
] | [
    casing: C, error: ErrorDefault<CaseValidatorSettings>
] | [
    CaseValidatorSettings<C>
]

/*** Constants ***/

const SPACE_DASH_UNDERSCORE = / |-|_/

/*** Helper ***/

function toCaseValidatorSettings<C extends Casing>(
    input: CaseValidatorSettingsShortcut<C>
): CaseValidatorSettings<C> {

    const [casingOrSettings, error] = input

    return isString(casingOrSettings)
        ? { case: casingOrSettings, error }
        : casingOrSettings
}

/*** Main ***/

class CaseValidator<C extends Casing>
    extends AssertTransformEqualValidator<string, CaseValidatorSettings<C>> {

    protected _getErrorDefaultAndArgs(
        input: string
    ): ErrorDefaultAndArgs<CaseValidatorSettings<C>> {

        const { settings } = this

        return [
            `must be ${settings.case} cased`,
            input,
            settings.case
        ]
    }

    protected _transform(input: string): string {

        const { settings } = this

        switch (settings.case) {

            case 'lower': {
                return input.toLocaleLowerCase()
            }

            case 'upper': {
                return input.toLocaleUpperCase()
            }

            case 'capital': {
                return capitalize(input)
            }

            case 'dash': {

                const delimiter = isString(settings.delimiter)
                    ? settings.delimiter
                    : undefined

                return toDashCase(input, delimiter)
            }

            case 'camel': {

                const { delimiter = SPACE_DASH_UNDERSCORE } = settings

                return toCamelCase(input, delimiter)
            }

            case 'pascal': {

                const { delimiter = SPACE_DASH_UNDERSCORE } = settings

                return capitalize(
                    toCamelCase(input, delimiter)
                )
            }

            default: {
                return input
            }
        }
    }
}

/*** Exports ***/

export default CaseValidator

export {
    CaseValidator,

    CaseValidatorSettingsShortcut,
    toCaseValidatorSettings
}