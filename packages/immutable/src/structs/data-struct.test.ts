import { DataStruct } from './data-struct'

import { test, expect } from '@jest/globals'
import { getState } from '../state'

import { expectTypeOf } from 'expect-type'

//// Tests ////

test(`${DataStruct.name}`, () => {

    class Person extends DataStruct {

        constructor(
            readonly name: string,
            readonly age: number
        ) {
            super()
        }

        speak(): string {
            return `Hello, my name is ${this.name}, and I am ${this.age} years old.`
        }

    }

    const jerry = new Person('Jerry', 32)

    expect(jerry.speak()).toEqual('Hello, my name is Jerry, and I am 32 years old.')
    expect(getState(jerry)).toEqual({ name: 'Jerry', age: 32 })

    expect({ ...jerry }).toEqual(getState(jerry))
    expectTypeOf(getState(jerry)).toEqualTypeOf<{ name: string, age: number }>()
})
