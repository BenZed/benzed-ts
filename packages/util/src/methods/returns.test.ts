import { returns } from './returns'

it('returns()', () => {

    const toFoo = returns('foo')

    expect(toFoo()).toEqual('foo')
    expect(returns('foo')).toEqual(toFoo)

})