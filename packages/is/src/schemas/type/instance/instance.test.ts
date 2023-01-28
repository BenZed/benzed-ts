
import { Instance } from './instance'

//// Tests //// 

class Foo {}

test('isInstance', () => {
    const isFoo = new Instance(Foo)   
    expect(isFoo(new Foo())).toEqual(true)

    expect(() => isFoo.validate('')).toThrow('Must be type Foo')
})

