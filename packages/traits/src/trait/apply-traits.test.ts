
import { test, expect } from '@jest/globals'
import { assign, isEqual, isShape } from '@benzed/util'
import { Trait } from './trait'

//// Setup ////

abstract class Emotional extends Trait {

    static readonly [Trait.onApply] = (e: Emotional): Emotional => 
        assign(e, { emotion: 'Happy' })

    static is: (input: unknown) => input is Emotional = isShape({
        emotion: isEqual('Happy', 'Sad'),
    })

    emotion: 'Happy' | 'Sad'

}

class Person extends Trait.use(Emotional) { }

//// Tests ////

test('apply traits', () => {
    const person = new Person()
    expect(person.emotion).toBe('Happy')
})