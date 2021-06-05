/* eslint-disable 
    @typescript-eslint/no-namespace,
    @typescript-eslint/prefer-readonly-parameter-types
*/

import { isSymbol } from '@benzed/is'
import createTypeValidator, {
    ValidatorProps,
    TypeValidatorFactoryOutput
} from '../type'

/*** Types ***/

type SymbolValidatorProps =
    ValidatorProps<symbol>

/*** Main ***/

function createSymbolValidator<P extends SymbolValidatorProps>(
    props: P
): TypeValidatorFactoryOutput<P, unknown, symbol> {

    return createTypeValidator(props, {
        name: 'Symbol',
        test: isSymbol,
        validate: []
    })

}

/*** Exports ***/

export default createSymbolValidator

export {
    createSymbolValidator,
    SymbolValidatorProps
}