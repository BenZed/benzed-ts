import { is } from './schema'
import { expectTypeOf } from 'expect-type'
import { TypeOf } from './types'

/*** Tests ***/

describe('chaining', () => {

    it('schemas can be chained', () => {

        const validate = is.string.or.boolean.or.array(is.number)

        const a = validate([])
        expectTypeOf<TypeOf<typeof validate>>()
            .toEqualTypeOf<string | boolean | unknown[]>()
    })

})