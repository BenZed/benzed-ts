/* eslint-disable 
    @typescript-eslint/no-namespace,
    @typescript-eslint/prefer-readonly-parameter-types
*/

import { isBoolean, isString } from '@benzed/is'

import createTypeValidator, {
    ValidatorProps,
    TypeValidatorFactoryOutput
} from '../type'

/*** Types ***/

type BooleanValidatorProps =
    ValidatorProps<boolean>

/*** Helper ***/

function castToBoolean(value: unknown): boolean {

    if (value === 'false')
        return false

    return !!value
}

/*** Main ***/

function createBooleanValidator(
    props: BooleanValidatorProps
): TypeValidatorFactoryOutput<BooleanValidatorProps, unknown, boolean> {

    return createTypeValidator(props, {
        name: 'Boolean',
        test: isBoolean,
        cast: castToBoolean,
        validate: []
    })

}

/*** Exports ***/

export default createBooleanValidator

export {
    createBooleanValidator,
    BooleanValidatorProps
}