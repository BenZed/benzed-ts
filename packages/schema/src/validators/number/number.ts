/* eslint-disable 
    @typescript-eslint/no-namespace,
    @typescript-eslint/prefer-readonly-parameter-types
*/

import { isNaN, isNumber } from '@benzed/is'
import createTypeValidator, {
    ValidatorProps,
    TypeValidatorFactoryOutput
} from '../type'

import createRangeValidator, { RangeValidatorProps } from './range'
import createRoundSanitizer, { RounderSanitizerProps } from './round'

/*** Types ***/

type NumberValidatorProps =
    ValidatorProps<number> &
    RangeValidatorProps &
    RounderSanitizerProps

/*** Helper ***/

function tryCastToNumber(value: unknown): unknown {
    const number = Number(value)
    return isNaN(number)
        ? value
        : number
}

/*** Main ***/

function createNumberValidator<P extends NumberValidatorProps>(
    props: P
): TypeValidatorFactoryOutput<P, unknown, number> {

    return createTypeValidator(props, {
        name: 'Number',
        test: isNumber,
        cast: tryCastToNumber,
        validate: [
            createRoundSanitizer(props),
            createRangeValidator(props),
        ]
    })
}

/*** Exports ***/

export default createNumberValidator

export {
    createNumberValidator,
    NumberValidatorProps
}