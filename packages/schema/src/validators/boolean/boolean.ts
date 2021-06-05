/* eslint-disable 
    @typescript-eslint/no-namespace,
    @typescript-eslint/prefer-readonly-parameter-types
*/

import { isBoolean } from '@benzed/is'
import createTypeValidator, {
    ValidatorProps,
    TypeValidatorFactoryOutput
} from '../type'

/*** Types ***/

type BooleanValidatorProps =
    ValidatorProps<boolean>

/*** Helper ***/

function tryCastToBoolean(value: unknown): unknown {
    return !!value
}

/*** Main ***/

function createBooleanValidator<P extends BooleanValidatorProps>(
    props: P
): TypeValidatorFactoryOutput<P, unknown, boolean> {

    return createTypeValidator(props, {
        name: 'Boolean',
        test: isBoolean,
        cast: tryCastToBoolean,
        validate: []
    })

}

/*** Exports ***/

export default createBooleanValidator

export {
    createBooleanValidator,
    BooleanValidatorProps
}