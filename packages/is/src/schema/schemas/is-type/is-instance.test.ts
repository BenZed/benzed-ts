import { it } from '@jest/globals'

import { IsInstance } from './is-instance'

//// Tests ////

class Foo {}

it('isInstance', () => {
    
    const isFoo = new IsInstance(Foo)   
    
    expect(isFoo(new Foo())).toEqual(true)

})

