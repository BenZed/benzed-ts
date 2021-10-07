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

    });

    [round, floor, ceil].forEach(func => {

        describe(`${func.name}()`, () => {
            it(`${func.name} numbers by a specific precision value`, () => {

                for (let place = 0.125; place < 10; place += 0.75) {
                    for (let i = 0; i < 10000; i++) {
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
