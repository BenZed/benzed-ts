import { returns } from './returns'
import { it, expect, test, describe } from '@jest/globals'

it('returns()', () => {

    const toFoo = returns('foo')

    expect(toFoo()).toEqual('foo')
    expect(returns('foo')).toEqual(toFoo)

})