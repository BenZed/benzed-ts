/* eslint-disable 
    @typescript-eslint/no-namespace
*/

import { isArray } from '@benzed/is'

import createTypeValidator, {
    ValidatorProps,
    TypeValidatorFactoryOutput
} from '../type'

import createLengthValidator, { LengthValidatorProps } from '../common/length'

/*** Types ***/

type ArrayValidatorProps =
    ValidatorProps<unknown[]> &
    LengthValidatorProps

/*** Helper ***/

function tryCastToArray(...args: unknown[]): unknown[] {
    return args.length > 0 ? [args[0]] : []
}

/*** Main ***/

function createArrayValidator<P extends ArrayValidatorProps>(
    props: P
): TypeValidatorFactoryOutput<P, unknown, unknown[]> {

    return createTypeValidator(props, {
        name: 'Array',
        test: isArray,
        cast: tryCastToArray,
        validate: [
            createLengthValidator(props)
        ]
    })

}

/*** Exports ***/

export default createArrayValidator

export {
    createArrayValidator,
    ArrayValidatorProps
}