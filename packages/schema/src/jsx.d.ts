/* eslint-disable 
    @typescript-eslint/no-namespace,
    @typescript-eslint/no-explicit-any
*/

import { DefaultValidators, Validator } from './validators/type'

/*** JSX ***/

declare global {
    namespace JSX {

        type IntrinsicElements = DefaultValidators

        type Element = Validator<any>

    }

}