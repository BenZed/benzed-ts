import { toFraction } from './to-fraction'
import { it, expect, describe } from '@jest/globals'

describe('creates fractions', () => {

    it('handles NaN', () =>
        expect(() => toFraction(NaN)).toThrow('cannot convert NaN to a fraction')
    )

    for (let numerator = 1; numerator < 10; numerator++) {
        for (let denominator = 1; denominator < 10; denominator++) {
            if ((numerator / denominator).toString().length > 7)
                continue
            else {
                it(
                    `${numerator / denominator} === ` +
                    `${toFraction(numerator / denominator).join('/')}`,

                    () => {
                        const fraction = toFraction(numerator / denominator)
                        expect(fraction[0] / fraction[1]).toEqual(numerator / denominator)
                    }
                )
            }
        }
    }
})

