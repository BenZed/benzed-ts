import { isFunction, isInstanceOf, isObject, isString } from '@benzed/is'
import { AssertValidator, ErrorDefault, ErrorSettings } from './validator'

/*** DATA ***/

const alpha = asRegExp`^[a-zA-Z]*$`
const numeric = asRegExp`^[0-9]*$`
const alphanumeric = asRegExp`^([a-zA-Z]|[0-9])+$`

const url = asRegExp`
    [-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)
`
const email = asRegExp`
    (?:[a-z0-9!#$%&'*+/=?^_\`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_\`
    {|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|
    \\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)
    +[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.)
    {3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:
    (?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])
`

const FORMAT_SHORTCUTS = {
    alpha,
    numeric,
    alphanumeric,
    url,
    email,
}

/*** Types ***/

type Format = RegExp | FormatShortcut

type FormatShortcut = keyof typeof FORMAT_SHORTCUTS

interface FormatValidatorSettings extends ErrorSettings<[
    input: string,
    formatTransgressionDetail: string
]> {
    readonly format: Format
}

type FormatValidatorSettingsShortcut =
    [
        format: Format
    ] |
    [
        format: Format,
        error: ErrorDefault<FormatValidatorSettings>
    ] |
    [
        FormatValidatorSettings
    ]

function isFormatShortcut(input: unknown): input is FormatShortcut {
    return (input as FormatShortcut) in FORMAT_SHORTCUTS
}

/*** Helper ***/

function asRegExp(
    str: TemplateStringsArray
): RegExp {
    return new RegExp(str.raw[0].replace(/\s/gm, ''), '')
}

function toRegExpDetail(format: Format): [regexp: RegExp, formatTransgressionDetail: string] {

    return isFormatShortcut(format)
        ? [FORMAT_SHORTCUTS[format], `formatted as ${format}`]
        : [format, `formatted to match ${format}`]

}

function isFormat(input: unknown): input is Format {
    return isFormatShortcut(input) ||
        isInstanceOf(input, RegExp)
}

function isFormatValidatorSettings(input: unknown): input is FormatValidatorSettings {
    return isObject<Partial<FormatValidatorSettings>>(input) &&
        isFormat(input.format) &&
        (
            input.error === undefined ||
            isString(input.error) ||
            isFunction(input.error)
        )
}

function toFormatValidatorSettings(
    input: FormatValidatorSettingsShortcut
): FormatValidatorSettings {

    const settings = isFormatValidatorSettings(input[0])
        ? input[0]
        : {
            format: input[0],
            error: input[1]
        }

    if (!isFormatValidatorSettings(settings))
        throw new Error(`${input} is not a valid format option.`)

    return settings
}

/*** Main ***/

class FormatValidator extends AssertValidator<string, FormatValidatorSettings> {

    protected _assert(input: string): void {

        const [regexp, detail] = toRegExpDetail(this.settings.format)

        if (!regexp.test(input)) {
            this._throwWithErrorSetting(
                `${input} must be ${detail}`,
                input,
                detail
            )
        }
    }

}

/*** Exports ***/

export default FormatValidator

export {
    FormatValidator,
    FormatValidatorSettings,

    FormatValidatorSettingsShortcut,
    toFormatValidatorSettings
}