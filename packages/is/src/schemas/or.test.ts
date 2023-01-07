import BooleanSchema from './boolean'
import { OrSchemata, OrSchema } from './or'

import { expectTypeOf } from 'expect-type'
import { StringSchema } from './string'
import NumberSchema from './number'

const $booleanOr = new OrSchemata(new BooleanSchema())
const isBooleanOrString = $booleanOr.string
const isBooleanOrStringOrNumber = isBooleanOrString.or.number

it('chain string or boolean example', () => {

    expectTypeOf(isBooleanOrString).toMatchTypeOf<OrSchema<[boolean, string]>>()

    expect(isBooleanOrString('ace')).toEqual(true)
    expect(isBooleanOrString.validate('ace')).toEqual('ace')

    expect(isBooleanOrString(true)).toEqual(true)
    expect(isBooleanOrString.validate(true)).toEqual(true)

    expect(isBooleanOrString(10)).toEqual(false)
    expect(() => isBooleanOrString.validate(10)).toThrow('Must be type boolean,Must be type string')

})

it('chain string or boolean or number', () => {
    expectTypeOf(isBooleanOrStringOrNumber).toMatchTypeOf<OrSchema<[boolean, string, number]>>()

    for (const value of ['string', true, 10])
        expect(isBooleanOrStringOrNumber(value)).toEqual(true)
})

it('chained schemas are flattened', () => {
    expect(isBooleanOrStringOrNumber.types).toHaveLength(3)
})

it('chain to arbitrary schema', () => {
    
    const isBooleanOrStringOrNumber2 = isBooleanOrString.or(new NumberSchema())

    expectTypeOf(isBooleanOrStringOrNumber2).toEqualTypeOf(isBooleanOrStringOrNumber)
})