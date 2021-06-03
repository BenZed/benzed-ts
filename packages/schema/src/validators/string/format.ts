import { isArray, isInstanceOf, isString } from '@benzed/is'
import ValidationError from '../../util/validation-error'

import { Validator } from '../type'

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

type FormatValidationErrorFormat = string | ((
    input: string,
    formatTransgressionDetail: string
) => string)
class FormatValidationError extends ValidationError {
    public constructor(
        input: string,
        formatTransgressionDetail: string,
        format: FormatValidationErrorFormat = (input, formatTransgressionDetail) =>
            `"${input}" must be ${formatTransgressionDetail}`
    ) {
        super(format, input, formatTransgressionDetail)
    }
}

type FormatShortcut = keyof typeof FORMAT_SHORTCUTS
type Format = RegExp | FormatShortcut

type FormatOption = {
    readonly test: Format
    readonly error?: FormatValidationErrorFormat
}

type FormatArrayOption =
    [
        format: Format
    ] |
    [
        format: Format,
        error: FormatValidationErrorFormat
    ]

type FormatValidatorProps = {
    format?: FormatArrayOption | FormatOption | Format
}

/*** Type Guards ***/

function isFormatShortcut(input: unknown): input is FormatShortcut {
    return (input as FormatShortcut) in FORMAT_SHORTCUTS
}

function isFormatOption(input: unknown): input is FormatOption {
    if (input === null || typeof input !== 'object')
        return false

    const { test: format } = input as FormatOption

    return format instanceof RegExp || typeof format === 'string'
}

/*** Helper ***/

function asRegExp(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    str: TemplateStringsArray
): RegExp {
    return new RegExp(str.raw[0].replace(/\s/gm, ''), '')
}

function toRegExpDetail(format: Format): [regexp: RegExp, formatTransgressionDetail: string] {

    if (isFormatShortcut(format)) {
        return [
            FORMAT_SHORTCUTS[format],
            `formatted as ${format}`
        ]
    }

    const regexp = format instanceof RegExp
        ? format
        : new RegExp(format)

    return [
        regexp,
        `formatted to match ${regexp}`
    ]
}

function toFormatOption(input: NonNullable<FormatValidatorProps['format']>): FormatOption {

    let option: FormatOption

    if (isArray(input)) {
        option = {
            test: input[0],
            error: input[1]
        }
    } else if (isString(input) || isInstanceOf(input, RegExp)) {
        option = {
            test: input
        }
    } else
        option = input

    if (!isFormatOption(option))
        throw new Error(`${input} is not a valid format option.`)

    return option
}

/*** Main ***/

function createFormatValidator(props: Readonly<FormatValidatorProps>): Validator<string> | null {

    if (!props.format)
        return null

    const { test: format, error } = toFormatOption(props.format)
    const [regexp, formatTransgressionDetail] = toRegExpDetail(format)

    return input => {
        if (!regexp.test(input)) {
            throw new FormatValidationError(
                input,
                formatTransgressionDetail,
                error
            )
        }

        return input
    }
}

/*** Exports ***/

export default createFormatValidator

export {
    createFormatValidator,
    FormatValidatorProps,

    toFormatOption,
    FormatOption,
}