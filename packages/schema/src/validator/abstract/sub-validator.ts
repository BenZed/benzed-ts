
import { 
    assign, 
    defined 
} from '@benzed/util'

import { NameErrorIdSignature, toNameErrorId } from './abstract-validate'

import AbstractValidator from './abstract-validator'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Main ////

abstract class SubValidator<T> extends AbstractValidator<T,T> {

    constructor(...args: NameErrorIdSignature<T>) {
        const { error, name, id } = toNameErrorId(...args) ?? {}
        super(error, id)
        assign(this, defined({ name }))
    }
}

//// Exports ////

export default SubValidator

export {
    SubValidator,

}