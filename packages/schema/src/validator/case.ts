import {
    AssertValidTransformValidator,
    ErrorDefault,
    ErrorDefaultAndArgs,
    ErrorSettings
} from './validator'

import {
    isPlainObject,
    isString
} from '@benzed/is'

import {
    capitalize,
    toCamelCase,
    toDashCase
} from '@benzed/string'

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
    'camel' |
    'pascal'

type CaseValidatorSettingsShortcut<C extends Casing> = Delimiter<C> extends never
    ? [
        error: ErrorDefault<CaseValidatorSettings<C>>
    ] | [
        Omit<CaseValidatorSettings<C>, 'case'>
    ]
    : [
        delimiter: Delimiter<C>
    ] | [
        delimiter: Delimiter<C>, error: ErrorDefault<CaseValidatorSettings<C>>
    ] | [
        Omit<CaseValidatorSettings<C>, 'case'>
    ]

function isDelimitedCasing(casing: Casing): casing is 'dash' | 'camel' | 'pascal' {
    return casing === 'dash' || casing === 'camel' || casing === 'pascal'
}

/*** Constants ***/

const SPACE_DASH_UNDERSCORE = / |-|_/

/*** Helper ***/

function toCaseValidatorSettings<C extends Casing>(
    input: CaseValidatorSettingsShortcut<C>,
    casing: C,
): CaseValidatorSettings<C> {

    type Error = ErrorDefault<CaseValidatorSettings<C>>
    type Settings = Omit<CaseValidatorSettings<C>, 'case'>

    const [arg1, arg2] = input

    const settings: Settings = isPlainObject<Settings>(arg1)
        ? arg1
        : isDelimitedCasing(casing)
            ? { error: arg2, delimiter: arg1 as Delimiter<C> }
            : { error: arg1 as Error }

    return {
        case: casing,
        ...settings
    }
}

/*** Main ***/

class CaseValidator<C extends Casing>
    extends AssertValidTransformValidator<string, CaseValidatorSettings<C>> {

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
    toCaseValidatorSettings,

    Casing
}