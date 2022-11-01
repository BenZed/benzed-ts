
import { isEven, isMultipleOf, isNegative, isOdd, isPositive } from './is-math'

const EVEN_NUMBERS = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]
const ODD_NUMBERS = EVEN_NUMBERS.map(num => num - 1)

describe('isEven()', () => {

    describe('returns true if input is even', () => {

        for (const even of EVEN_NUMBERS) {
            it(`${even} === true`, () => {
                expect(isEven(even)).toBe(true)
            })
        }
    })

    describe('returns false if input is odd', () => {

        for (const odd of ODD_NUMBERS) {
            it(`${odd} === false`, () => {
                expect(isEven(odd)).toBe(false)
            })
        }
    })
})

describe('isOdd()', () => {

    describe('returns true if input is even', () => {

        for (const even of EVEN_NUMBERS) {
            it(`${even} === false`, () => {
                expect(isOdd(even)).toBe(false)
            })
        }
    })

    describe('returns false if input is odd', () => {

        for (const odd of ODD_NUMBERS) {
            it(`${odd} === true`, () => {
                expect(isOdd(odd)).toBe(true)
            })
        }
    })
})

describe('isPositve()', () => {

    describe('returns true if input is positive', () => {
        for (const [input, output] of [
            [1, true],
            [10, true],
            [Infinity, true]

        ]) {
            it(`${input} > 0 === ${output}`, () => {
                expect(isPositive(input)).toBe(output)
            })
        }
    })

    describe('returns false if input is negative', () => {
        for (const [input, output] of [
            [-1, false],
            [-10, false],
            [-Infinity, false]

        ]) {
            it(`${input} > 0 === ${output}`, () => {
                expect(isPositive(input)).toBe(output)
            })
        }
    })

})

describe('isPositve()', () => {

    describe('returns false if input is positive', () => {
        for (const [input, output] of [
            [1, false],
            [10, false],
            [Infinity, false]

        ]) {
            it(`${input} > 0 === ${output}`, () => {
                expect(isNegative(input)).toBe(output)
            })
        }
    })

    describe('returns true if input is negative', () => {
        for (const [input, output] of [
            [-1, true],
            [-10, true],
            [-Infinity, true]

        ]) {
            it(`${input} > 0 === ${output}`, () => {
                expect(isNegative(input)).toBe(output)
            })
        }
    })
})

describe('isMultipleOf', () => {

    describe('returns true if the input is a multiple of a given number', () => {

        for (const [input, multiple, output] of [
            [10, 1, true],
            [10.5, 1, false],
            [4, 2, true],
            [7, 2, false],
            [9, 3, true],
            [10, 3, false],
            [1.5, 0.5, true],
            [2.25, 0.5, false],
            [-4, -2, true],
            [-3, -2, false]
        ] as [number, number, boolean][]) {
            it(`${input} % ${multiple} === ${output}`, () => {
                expect(isMultipleOf(input, multiple)).toBe(output)
            })
        }
    })

})