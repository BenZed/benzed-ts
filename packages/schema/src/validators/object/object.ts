/* eslint-disable 
    @typescript-eslint/no-namespace,
    @typescript-eslint/prefer-readonly-parameter-types,
    @typescript-eslint/ban-types
*/

import { isObject } from '@benzed/is'

import createTypeValidator, {
    ValidatorProps,
    TypeValidatorFactoryOutput
} from '../type'

/*** Types ***/

type ObjectValidatorProps = ValidatorProps<object>

/*** Main ***/

function createObjectValidator(
    props: ObjectValidatorProps
): TypeValidatorFactoryOutput<ObjectValidatorProps, unknown, object> {

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