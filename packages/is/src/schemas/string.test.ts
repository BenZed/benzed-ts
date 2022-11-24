import { string } from './string'

it('validates strings', () => {
    expect(string('foo')).toEqual('foo')
})