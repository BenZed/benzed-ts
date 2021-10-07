import createRangeValidator, {
    RangeComparator,
    BetweenComparator,
    RangeValidatorProps
} from './range'
import { lerp } from '../../../../math/src'
import { Validator } from '../type'

/*** Helper ***/

const createRangeValidatorDirect = (
    range: NonNullable<RangeValidatorProps['range']>
): Validator<number> => {
    return createRangeValidator({
        range
    }) as Validator<number>
}

function testDoubleCompare(
    rangeValidatorFunc: Validator<number>,
    min: number,
    max: number,
    comparator: BetweenComparator
): void {

    const inclusive = comparator === '...'

    it(`${min - 1} should fail`, () => {
        expect(() => rangeValidatorFunc(min - 1))
            .toThrow('must be')
    })

    it(`${max + 1} should fail`, () => {
        expect(() => rangeValidatorFunc(max + 1))
            .toThrow('must be')
    })

    it(`${lerp(min, max, 0.5)} should pass`, () => {
        expect(() => rangeValidatorFunc(lerp(min, max, 0.5)))
            .not.toThrow('must be')
    })

    it(`${min} should pass`, () => {
        expect(() => rangeValidatorFunc(min))
            .not.toThrow('must be')
    })

    it(`${max} should ${inclusive ? 'pass' : 'fail'}`, () => {

        const expectRangeFunc = expect(() => rangeValidatorFunc(max))

        if (inclusive)
            expectRangeFunc.not.toThrow('must be')
        else
            expectRangeFunc.toThrow('must be')
    })

}

function testSingleCompare(
    rangeValidatorFunc: Validator<number>,
    comparator: RangeComparator,
    value: number
): void {

    if (comparator === '==') {

        it(`${value} === ${value}`, () => {
            expect(() => rangeValidatorFunc(value)).not.toThrow()
        })

        it(`${value - 1} !== ${value}`, () => {
            expect(() => rangeValidatorFunc(value - 1)).toThrow('must be')
        })

        it(`${value + 1} !== ${value}`, () => {
            expect(() => rangeValidatorFunc(value + 1)).toThrow('must be')
        })

    } else {

        const below = comparator.includes('<')

        const inclusive = comparator.includes('=')

        const prefix = below
            ? 'less than'
            : 'more than'

        const suffix = inclusive
            ? ' or equal to'
            : ''

        const valid = below ? value - 1 : value + 1
        const invalid = below ? value + 1 : value - 1

        it(`${valid} is ${prefix}${suffix} ${value}`, () => {
            expect(() => rangeValidatorFunc(valid)).not.toThrow('must be')
        })

        it(`${invalid} is not ${prefix}${suffix} ${value}`, () => {
            expect(() => rangeValidatorFunc(invalid)).toThrow('must be')
        })

        it(`${value} ${inclusive ? 'is' : 'is not'} ${prefix}${suffix} ${value}`, () => {
            const expectRangeValidator = expect(() => rangeValidatorFunc(value))

            if (inclusive)
                expectRangeValidator.not.toThrow('must be')
            else
                expectRangeValidator.toThrow('must be')
        })
    }

}

/*** Tests ***/

describe('range attribute validator', () => {

    describe('creates a function that valiates a range', () => {
        const zeroToFive = createRangeValidatorDirect({ min: 0, max: 5 })
        testDoubleCompare(zeroToFive, 0, 5, '..')
    })

    describe('range signature', () => {

        describe('can take a string argument: "1-10"', () => {
            const oneToTen = createRangeValidatorDirect('1-10')
            testDoubleCompare(oneToTen, 1, 10, '..')
        })

        describe('can take a string argument: "2..4"', () => {
            const twoToFour = createRangeValidatorDirect('2..4')
            testDoubleCompare(twoToFour, 2, 4, '..')
        })

        describe('can take numerical arguments: -6,6', () => {
            const negativeSixToFiveAndAHalf = createRangeValidatorDirect([-6, 5.5])
            testDoubleCompare(negativeSixToFiveAndAHalf, -6, 5.5, '..')
        })

        describe('can take numerical arguments with inclusive comparator: -10,"...",10', () => {
            const negativeSixToSix = createRangeValidatorDirect([-6, '...', 6])
            testDoubleCompare(negativeSixToSix, -6, 6, '...')
        })

        describe('can take array arguments with exclusive comparator: 2,"..",7', () => {
            const twoToSeven = createRangeValidatorDirect([2, '..', 7])
            testDoubleCompare(twoToSeven, 2, 7, '..')
        })

        describe('can take array arguments with exclusive comparator: 3,"-",6', () => {
            const threeToSix = createRangeValidatorDirect([3, '-', 6])
            testDoubleCompare(threeToSix, 3, 6, '-')
        })

        describe('can take array arguments with range comparator: "<",6', () => {
            const lessThanSix = createRangeValidatorDirect(['<', 6])
            testSingleCompare(lessThanSix, '<', 6)
        })

        describe('can take array arguments with equal range comparator: ">=",10', () => {
            const moreThanOrEqualToTen = createRangeValidatorDirect(['>=', 10])
            testSingleCompare(moreThanOrEqualToTen, '>=', 10)
        })

        describe('can take array arguments with equal comparator: "==",1', () => {
            const equalOne = createRangeValidatorDirect(['==', 1])
            testSingleCompare(equalOne, '==', 1)
        })

        describe('can take object argument: { value: 100, comparator: ">" } ', () => {
            const moreThanOneHundred = createRangeValidatorDirect({ value: 100, comparator: '>' })
            testSingleCompare(moreThanOneHundred, '>', 100)
        })

        describe('can take single numerical argument: 100', () => {
            const equalOneHundred = createRangeValidatorDirect(100)
            testSingleCompare(equalOneHundred, '==', 100)
        })

        describe('can take single array numerical argument: [50]', () => {
            const equalOneHundred = createRangeValidatorDirect([50])
            testSingleCompare(equalOneHundred, '==', 50)
        })

        describe('custom error message', () => {

            it('string', () => {

                const error = 'that is less than a billion, dog.'

                const moreThanABillion = createRangeValidatorDirect({
                    comparator: '>=',
                    value: 1000000000,
                    error
                })

                expect(() => moreThanABillion(0)).toThrow(error)
            })

            it('fail message function', () => {

                const moreThanABillion = createRangeValidatorDirect([
                    '>=',
                    1000000000,
                    (value, detail) => `${value} is not ${detail}, homie.`
                ])

                expect(() => moreThanABillion(0))
                    .toThrow('0 is not above or equal 1000000000, homie.')
            })
        })
    })
})