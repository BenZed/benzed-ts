import { returns } from '../../lib'

it('returns()', () => {

    const toFoo = returns('foo')

    expect(toFoo()).toEqual('foo')
    expect(returns('foo')).toEqual(toFoo)

})