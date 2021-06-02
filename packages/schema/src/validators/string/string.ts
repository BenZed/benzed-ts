/* eslint-disable 
    @typescript-eslint/no-namespace,
    @typescript-eslint/prefer-readonly-parameter-types
*/
import { isString } from '@benzed/is'

import {
    ValueValidatorProps,
    ValidatorFactoryOutput
} from '../type'

import createTypeValidator from '../type'

import createTrimSanitizer, { TrimSanitizerProps } from './trim'
import createCaseSanitizer, { CaseSanitizerProps } from './case'
import createLengthValidator, { LengthValidatorProps } from '../common/length'
import createFormatValidator, { FormatValidatorProps } from './format'

/*** Types ***/

type StringValidatorProps =
    ValueValidatorProps<string> &
    CaseSanitizerProps &
    TrimSanitizerProps &
    FormatValidatorProps &
    LengthValidatorProps

/*** Helper ***/

function tryCastToString(value: unknown): unknown {
    try {
        return `${value}`
    } catch {
        return String(value)
    } finally {
        return value
    }
}

/*** Main ***/

function createStringValidator(
    props: Readonly<StringValidatorProps>
): ValidatorFactoryOutput<string, StringValidatorProps> {

    return createTypeValidator(props, {
        name: 'String',
        test: isString,
        cast: tryCastToString,
        validators: [
            createTrimSanitizer(props),
            createCaseSanitizer(props),
            createLengthValidator<string>(props),
            createFormatValidator(props)
        ]
    })

}

/*** Exports ***/

export default createStringValidator

export {
    createStringValidator,
    StringValidatorProps
}