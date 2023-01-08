
import { IsInstance } from './is-instance'

//// Tests ////

class Foo {}

test('isInstance', () => {
    const isFoo = new IsInstance(Foo)   
    expect(isFoo(new Foo())).toEqual(true)

    expect(() => isFoo.validate('')).toThrow('Must be type Foo')
})
