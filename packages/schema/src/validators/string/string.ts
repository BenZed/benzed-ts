/* eslint-disable 
    @typescript-eslint/no-namespace,
    @typescript-eslint/prefer-readonly-parameter-types
*/
import { isString } from '@benzed/is'

import createTypeValidator, {
    ValidatorProps,
    TypeValidatorFactoryOutput
} from '../type'

import createTrimSanitizer, { TrimSanitizerProps } from './trim'
import createCaseSanitizer, { CaseSanitizerProps } from './case'
import createLengthValidator, { LengthValidatorProps } from '../common/length'
import createFormatValidator, { FormatValidatorProps } from './format'

/*** Types ***/

type StringValidatorProps =
    ValidatorProps<string> &
    CaseSanitizerProps &
    TrimSanitizerProps &
    FormatValidatorProps &
    LengthValidatorProps

/*** Helper ***/

function tryCastToString(value: unknown): unknown {

    try {
        value = `${value}`
    } catch (e) {
        value = String(value)
    } finally {
        return value
    }
}

/*** Main ***/

function createStringValidator<P extends StringValidatorProps>(
    props: P
): TypeValidatorFactoryOutput<P, unknown, string> {

    return createTypeValidator(props, {
        name: 'String',
        test: isString,
        cast: tryCastToString,
        validate: [
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