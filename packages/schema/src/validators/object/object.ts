/* eslint-disable 
    @typescript-eslint/no-namespace,
    @typescript-eslint/prefer-readonly-parameter-types
*/

import { isObject } from '@benzed/is'

import createTypeValidator, {
    ValidatorProps,
    TypeValidatorFactoryOutput
} from '../type'

/*** Types ***/

type ObjectValidatorProps =
    ValidatorProps<object>

/*** Main ***/

function createObjectValidator<P extends ObjectValidatorProps>(
    props: P
): TypeValidatorFactoryOutput<P, unknown, object> {

    return createTypeValidator(props, {
        name: 'Object',
        test: isObject,
        validate: []
    })

}

/*** Exports ***/

export default createObjectValidator

export {
    createObjectValidator,
    ObjectValidatorProps
}