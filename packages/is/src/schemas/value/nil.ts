import { 
    AbstractSchema, 
    NameErrorIdSignature, 
    toNameErrorId
} from '@benzed/schema'

import { 
    asNil, 
    isNil, 
    nil 
} from '@benzed/util'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

class Nil extends AbstractSchema<unknown, nil> {

    constructor(...args: NameErrorIdSignature<unknown>) {
        super({
            isValid: isNil,
            transform: asNil,
            ...toNameErrorId(...args)
        })
    }

}

//// Exports ////

export default Nil

export {
    Nil
}

export const $nil = new Nil()