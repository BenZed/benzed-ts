import { is } from './schema'
import { expectTypeOf } from 'expect-type'
import { TypeOf } from './types'

/*** Tests ***/

describe('chaining', () => {

    it('schemas can be chained', () => {

        const isStringOrBooleanOrArray = is.string.or.boolean

        const a = isStringOrBooleanOrArray([])
        expectTypeOf<TypeOf<typeof validate>>()
            .toEqualTypeOf<string | boolean | unknown[]>()
    })

})