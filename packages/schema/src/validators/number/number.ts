/* eslint-disable 
    @typescript-eslint/no-namespace,
    @typescript-eslint/prefer-readonly-parameter-types
*/

import { isNaN, isNumber } from '@benzed/is'
import {
    ValidatorProps,
    TypeValidatorFactoryOutput
} from '../type'

import createTypeValidator from '../type'
import createRangeValidator, { RangeValidatorProps } from './range'
import createRoundSanitizer, { RounderSanitizerProps } from './round'

/*** Types ***/

type NumberValidatorProps =
    ValidatorProps<string | unknown> &
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

function createStringValidator(
    props: NumberValidatorProps
): TypeValidatorFactoryOutput<number | unknown, NumberValidatorProps> {

    return createTypeValidator(props, {
        name: 'Number',
        test: isNumber,
        cast: tryCastToNumber,
        validators: [
            createRoundSanitizer(props),
            createRangeValidator(props),
        ]
    })

}

/*** Exports ***/

export default createStringValidator

export {
    createStringValidator,
    NumberValidatorProps
}