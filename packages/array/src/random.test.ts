import random from './random'
import { equals } from '../../immutable/src/equals'

// eslint-disable-next-line no-unused-vars

function expectEqualOccurances<T>(
    input: ArrayLike<T> | Iterable<T>,
    values: readonly T[],
    count = values.length * 5000
): void {

    const results: T[] = []
    for (let i = 0; i < count; i++) 
        results.push(random(input))

    const average = count / values.length
    const slop = count * 0.01

    for (const value of values) {
        const occurances = results
            .reduce(
                (c, v) => equals(v, value)
                    ? c + 1
                    : c
                , 0
            )
        try {
            expect(
                occurances >= average - slop,
            ).toBeTruthy()

            expect(
                occurances <= average + slop,
            ).toBeTruthy()
        } catch (err) {
            throw new Error(
                `${value} should have been generated ${average} +- ${slop} times: ${occurances}`
            )
        }
    }
}

it('gives a random element in an array', () => {

    const arr = ['zero', 'one', 'two', 'three', 'four']

    expectEqualOccurances(arr, arr)
})

it('gives a random element in a strings', () => {
    const str = '~!@#$%^&*()'
    expectEqualOccurances(str, str.split(''))
})

it('gives a random element of an array-like', () => {
    const arrlike = {
        length: 5,
        0: 'a',
        1: 100,
        2: { truth: false },
        3: { falsy: true },
        4: ['onomatapeia']
    }
    expectEqualOccurances(arrlike, Array.from(arrlike))
})

it('gives a random element in a set', () => {
    const set = new Set([0, 1, 2, 3, 4, 5, 6])
    expectEqualOccurances(set, [...set])
})

it('gives a random element in a map', () => {
    const map = new Map([['one', 1], ['two', 2], ['three', 3], ['four', 4]])
    expectEqualOccurances(map, [...map])
})

it('returns undefined on empty arrays', () => {
    expect(random([])).toEqual(undefined)
})

it('optionally bindable', () => {
    const arrlike = {
        length: 5,
        0: 'a',
        1: 'b',
        2: 'c',
        random
    }

    const output = arrlike.random()
    expect(Array.from(arrlike)).toContain(output)
})