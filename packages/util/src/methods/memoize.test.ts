import { memoize } from './memoize'
import { isPrime } from '../../../math/src'

it('memoize()', () => {

    let calls = 0 

    const add = (a:number,b: number): number => {
        calls++
        return a + b
    }

    const memoAdd = memoize(add)

    expect(memoAdd(5, 5)).toEqual(10)
    expect(memoAdd(5,5)).toEqual(10)
    expect(calls).toEqual(1)

    expect(memoAdd(10,10)).toEqual(20)
    expect(memoAdd(10,10)).toEqual(20)
    expect(calls).toEqual(2)
})

it('names method', () => {
    const memoPrime = memoize(isPrime)
    expect(memoPrime.name).toEqual(isPrime.name)
})

it('optional method name', () => {
    const ace = memoize(() => 'ace', 'ace')
    expect(ace.name).toEqual('ace')
})

// I refused to answer why this test is necessary
it('seperate cache for each method', () => {

    const memoIsPrime = memoize(isPrime)
    const memoIsEven = memoize((i: number) => i % 2 === 0, 'isEven')
    
    expect(memoIsPrime(10))
        .not
        .toEqual(memoIsEven(10))
})

it('memoizes promises', async () => {

    const calls: number[] = []

    const delay = memoize((id: number) => {
        calls.push(id)
        return new Promise(resolve => setTimeout(resolve, 50))
    })

    // First call
    const output1 = delay(0)
    expect(calls).toEqual([0])

    // Second call returns the yet-resolved promise created by the first call
    const output2 = delay(0)
    expect(output1).toBe(output2)

    await Promise.all([output1, output2])

    // Third call returns not the promise but the resolved value
    await delay(0)
    expect(calls).toEqual([0])

    await delay(1)
    expect(calls).toEqual([0, 1])

})

// Dunno about this. Output of memoized methods should not depend on 'this' state,
// Obviously because 'this' state is not considered when retrieving a cached value,
// but I feel like this is better than throwing a "this is not defined" error.
// TODO: perhaps an additional option method to grab values from 'this' that are
// pertinent to memoization
it('preserves <this>', () => {

    const foo = {
        bar: 'bar',
        combine(prefix: string): string {
            return prefix + this.bar
        }
    }

    const combine = foo.combine = memoize(foo.combine)

    expect(() => combine('hello')).toThrow('Cannot read properties of undefined')
    expect(foo.combine('hello')).toEqual(combine('hello'))
    expect(combine('hello')).toEqual('hellobar')
    expect(() => combine('sup')).toThrow('Cannot read properties of undefined')

})

it('max cache size option', () => {

    let calls = 0
    const x2 = (i: number): number => {
        calls++ 
        return i * 2
    }

    const singleMemo = memoize(x2, 1)

    // prove that one entry is cached
    expect(singleMemo(1)).toEqual(2)
    expect(singleMemo(1)).toEqual(2)
    expect(calls).toEqual(1)

    // prove that a second entry is cached
    expect(singleMemo(2)).toEqual(4)
    expect(singleMemo(2)).toEqual(4)
    expect(calls).toEqual(2)
    
    // prove that the first entry was removed
    expect(singleMemo(1)).toEqual(2)
    expect(calls).toEqual(3)

})