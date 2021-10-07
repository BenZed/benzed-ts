import { Validator } from '../type'
import createLengthValidator, { LengthValidatorProps } from './length'

/*** Helper ***/

const createLengthValidatorDirect = <T extends { length: number }>(
    length: NonNullable<LengthValidatorProps['length']>
): Validator<T> =>
    createLengthValidator({ length }) as Validator<T>

/*** Exports ***/

describe('length attribute validator', () => {

    describe('creates a function that validates an input\'s length', () => {
        const moreThanZero = createLengthValidatorDirect({ comparator: '>', value: 0 })

        it('by default, has a different error message than createRangeValidator', () => {
            expect(() => moreThanZero('')).toThrow('length must be')
        })

        it('{ length: 1 } satisfies >1', () => {
            expect(() => moreThanZero({ length: 1 })).not.toThrow('must be')
        })

        it('{ length: 0 } fails >1', () => {
            expect(() => moreThanZero({ length: 0 })).toThrow('must be')
        })

        it('"hey" fails >1', () => {
            expect(() => moreThanZero('hey')).not.toThrow('must be')
        })

        it('"" fails >1', () => {
            expect(() => moreThanZero('')).toThrow('must be')
        })
    })

    // the length validator is built by extending the range validator, so re-writing 
    // all the range tests would be redundant
})