import { random, round, floor, ceil } from './overrides'

/* global describe it */

describe('overridden methods', () => {

    describe('random($min, $max, $alt)', () => {

        const RANDOM_ITERATIONS = 1000

        it('creates random numbers between min positive and max positive value', () => {
            for (let i = 0; i < RANDOM_ITERATIONS; i++) {
                const result = random(50, 150)
                expect(result).toBeGreaterThan(50)
                expect(result).toBeLessThan(150)
            }
        })

        it('creates random numbers between min negative and max positive value', () => {
            for (let i = 0; i < RANDOM_ITERATIONS; i++) {
                const result = random(-50, 50)
                expect(result).toBeGreaterThanOrEqual(-50)
                expect(result).toBeLessThan(50)
            }
        })

        it('creates random numbers between min negative and max negative value', () => {
            for (let i = 0; i < RANDOM_ITERATIONS; i++) {
                const result = random(-150, -50)
                expect(result).toBeGreaterThanOrEqual(-150)
                expect(result).toBeLessThan(-50)
            }
        })

        it('third argument seed can be provided to seed a random number', () => {
            for (let seed = 0; seed < RANDOM_ITERATIONS; seed += 1) {
                const r1 = random(0, 10, seed)
                const r2 = random(0, 10, seed)
                expect(r1).toBeGreaterThanOrEqual(0)
                expect(r1).toBeLessThan(10)
                expect(r1).toEqual(r2)
            }
        })

    })

    describe('correct rounding boundary', () => {
        for (const { input, output } of [
            {
                input: 4.5,
                output: {
                    100: 0,
                    10: 0,
                    1: 5,
                    0.1: 4.5,
                    0.01: 4.5,
                    0.001: 4.5,
                    0.0001: 4.5
                }
            },
            {
                input: 1212.1245,
                output: {
                    100: 1200,
                    10: 1210,
                    1: 1212,
                    0.1: 1212.1,
                    0.01: 1212.12,
                    0.001: 1212.125,
                    0.0001: 1212.1245
                }
            },
            {
                input: Math.PI,
                output: {
                    100: 0,
                    10: 0,
                    1: 3,
                    0.1: 3.1,
                    0.01: 3.14,
                    0.001: 3.142,
                    0.0001: 3.1416
                }
            }, {
                input: 123456789.87654321,
                output: {
                    100: 123456800,
                    10: 123456790,
                    1: 123456790,
                    0.1: 123456789.9,
                    0.01: 123456789.88,
                    0.001: 123456789.877,
                    0.0001: 123456789.8765
                }
            }
        ]) {
            for (const precision of [100, 10, 1, 0.1, 0.01, 0.001, 0.0001] as const) {

                {
                    it(`${input} by ${precision} === ${output[precision]}`, () => {
                        expect(round(input, precision)).toEqual(output[precision])
                    })
                }
            }
        }

    });

    [round, floor, ceil].forEach(func => {

        describe(`${func.name}()`, () => {
            it(`${func.name} numbers by a specific precision value`, () => {

                for (let place = 0.125; place < 10; place += 0.75) {
                    for (let i = 0; i < 1000; i++) {
                        const result = func(random(0, 100), place)
                        expect(result % place).toEqual(0)
                    }
                }
            })

            it('negative precision values are treated as positive', () => {
                const neg = func(5.5, -2)
                const pos = func(5.5, 2)
                expect(neg).toEqual(pos)
            })

            it('0 precision means no rounding', () => {
                const _in = 5.1234
                const out = func(_in, 0)
                expect(_in).toEqual(out)
            })
        })
    })
})
