
import { test, expect } from '@jest/globals'
import { assign, isEqual, isShape } from '../../types'
import { Trait } from './trait'

//// Setup ////

abstract class Emotional extends Trait {

    static readonly [Trait.apply] = (e: Emotional): Emotional => 
        assign(e, { emotion: 'Happy' })

    static is: (input: unknown) => input is Emotional = isShape({
        emotion: isEqual('Happy', 'Sad'),
    })

    emotion: 'Happy' | 'Sad'

}

//// Tests ////

test('apply traits', () => {

    class Person extends Trait.use(Emotional) {

    }

    const person = new Person()

    expect(person.emotion).toBe('Happy')
})
