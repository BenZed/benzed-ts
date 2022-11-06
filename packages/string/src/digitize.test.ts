import { PI } from '@benzed/math'
import digitize from './digitize'

describe(`digitize`, () => {

    it(`converts a number to a string`, () => {
        expect(digitize(0)).toEqual(`0`)
    })

    for (const toZero of [Infinity, -Infinity, NaN]) {
        it(`converts ${toZero} to zero`, () => {
            expect(digitize(toZero)).toEqual(`0`)
        })
    }

    describe(`decimal options`, () => {

        describe(`decimalPlaces`, () => {

            it(`number of decimal places to round to`, () => {
                expect(digitize(1.2, { decimalPlaces: 2 })).toEqual(`1.2`)
            })

            it(`decimal places are correctly rounded`, () => {
                expect(digitize(1.258, { decimalPlaces: 2 })).toEqual(`1.26`)
            })

            it(`must be an integer`, () => {
                expect(() => digitize(PI, { decimalPlaces: 1.5 }))
                    .toThrow(`decimalPlaces must be an integer`)
            })

        })

        describe(`trailingZeros`, () => {
            it(`fills trailing zeros to decimal places`, () => {
                expect(digitize(1.2, { decimalPlaces: 5, trailingZeros: true }))
                    .toEqual(`1.20000`)
            })
        })

    })

    describe(`whole options`, () => {

        describe(`wholePlaces`, () => {
            it(`adds leading zeros to output`, () => {
                expect(digitize(78, { wholePlaces: 5 }))
                    .toEqual(`00078`)
            })

            it(`0 has no effect`, () => {
                expect(digitize(78, { wholePlaces: 0 }))
                    .toEqual(`78`)
            })

            it(`must be an integer`, () => {
                expect(() => digitize(PI, { wholePlaces: 1.5 }))
                    .toThrow(`wholePlaces must be an integer`)
            })
        })

        describe(`truncateWhole`, () => {
            it(`truncates numbers that have more digits than wholePlaces`, () => {
                expect(digitize(12345, { wholePlaces: 4, truncateWhole: true }))
                    .toEqual(`2345`)
            })

            it(`combined with wholePlace 0, removes everything before the decimal`, () => {
                expect(digitize(12345.67, { wholePlaces: 0, truncateWhole: true }))
                    .toEqual(`.67`)
            })
        })
    })

    describe(`Both option types work in unison`, () => {

        for (const { options, input, output } of [
            {
                options: {
                    wholePlaces: 4,
                    decimalPlaces: 2,
                    trailingZeros: true
                },
                input: 10,
                output: `0010.00`
            },
            {
                options: {
                    wholePlaces: 2,
                    decimalPlaces: 2,
                    truncateWhole: true
                },
                input: 11958.000001,
                output: `58`
            },
            {
                options: {
                    wholePlaces: 3,
                    decimalPlaces: 3,
                    truncateWhole: true,
                    trailingZeros: true
                },
                input: 1212.1245,
                output: `212.125`
            },
        ]) {
            it(`${input} @${JSON.stringify(options).replace(/"/g, ``)} -> ${output}`, () => {
                expect(digitize(input, options)).toBe(output)
            })
        }

    })
})