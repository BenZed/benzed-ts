import { Callable } from './callable-as-a-trait'
import { Trait } from './trait'

import { test } from '@jest/globals'

//// Callable Signature ////

const Multiplier = Callable<(i: number) => number>

//// Callable Trait ////

class Multiply extends Trait.use(Multiplier) {

    protected get [Multiplier.signature](): (i: number) => number {
        return this.multiply
    }

    multiply(input: number): number {
        return this.by * input
    }

    constructor(public by: number) {
        super()
    }

}

//// Exports ////

it('is abstract', () => {
    // @ts-expect-error Abstract
    expect(() => void new Callable()).toThrow(Error)
})

test('creates instances with call signatures', () => {

    const x2 = new Multiply(2) 

    expect(x2.constructor).toBe(Multiply)
    expect(x2(1)).toBe(2)
    expect(Multiply.is(x2)).toBe(true)
})

it('keeps getters, setters and instance instance methods', () => {

    abstract class ValueCallable<T> extends Callable<() => T> {
        
        abstract get value(): T 
        abstract set value(value: T)

        getValue(): T {
            return this.value
        }

        setValue(value: T): void {
            this.value = value
        }

        protected get [Callable.signature]() {
            return function () {
                return this.value
            }
        } 
 
    } 

    class Number extends Trait.use(ValueCallable<number>) {
        constructor(public value = 0) {
            super()
        } 
    } 

    const value = new Number(5) 

    expect(value).toHaveProperty('value', 5)
    expect(value).toHaveProperty('getValue')
    expect(value).toHaveProperty('setValue')

    expect(value.value).toEqual(5)
    expect(value.getValue()).toEqual(5)

    expect(value()).toEqual(5)

    value.setValue(10)
    expect(value.value).toEqual(10)
    expect(value.getValue()).toEqual(10)
    expect(value()).toEqual(10)

    value.value = 15
    expect(value.value).toEqual(15)
    expect(value.getValue()).toEqual(15)
    expect(value()).toEqual(15)   

    class ArrayValue extends Trait.use(ValueCallable<number[]>) {

        unwrap(): number {
            return this.value[0]
        }  

        constructor(public value: number[]) {
            super()
        }  

    }

    const arrayValue = new ArrayValue([5])
    expect(arrayValue.getValue()).toEqual([5])
    expect(arrayValue.unwrap()).toEqual(5)

})
