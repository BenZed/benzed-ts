import until from './until'
import fs from 'fs'
import path from 'path'

// eslint-disable-next-line no-unused-vars

describe('until', () => {

    describe('config', () => {

        describe('condition function', () => {

            it('determines when while loop closes', async () => {
                let i = 0
                const ms = await until(() => ++i > 1)
                expect(i).toBe(2)
                expect(ms >= 25).toBe(true)
            })

            it('takes delta ms as argument', async () => {
                let _delta = 0
                await until(delta => (_delta = delta) >= 25)

                expect(_delta >= 25).toBe(true)
            })
        })

        describe('timeout', () => {

            it('maximum time, in milliseconds, while loop can run', async () => {

                expect.assertions(1)

                try {
                    await until(
                        () => false,
                        {
                            timeout: 20,
                            interval: 1
                        }
                    )
                } catch (e: unknown) {
                    expect((e as Error).message).toContain('Could not resolve condition in 20 ms')
                }
            })

            it('defaults to infinity', () => {
                // lol
                const str = fs.readFileSync(path.join(__dirname, 'until.ts'))

                expect(str.toString()).toContain('DEFAULT_TIMEOUT = Infinity')
            })
        })

        describe('interval', () => {
            it('condition is checked every <interval> ms', async () => {
                let i = 0
                const ms = await until(
                    () => i++ === 3,
                    {
                        interval: 5
                    })

                expect(ms >= 15 && ms < 20).toBe(true)
            })
            it('defaults to 25', async () => {
                let _switch = true
                const ms = await until(() => {
                    _switch = !_switch; return _switch
                })

                expect(ms >= 25 && ms < 50).toBe(true)
            })
        })

        describe('timeoutMsg', () => {
            it('message to throw in error if while loop times out', async () => {
                expect.assertions(1)

                try {
                    await until(
                        () => false,
                        {
                            interval: 1,
                            timeout: 10,
                            timeoutMsg: 'if it cannot be done in 10 milliseconds, it cannot be done'
                        }
                    )
                } catch (e: unknown) {
                    expect((e as Error).message)
                        .toContain('if it cannot be done in 10 milliseconds, it cannot be done')
                }
            })

        })
    })

    it('returns number of milliseconds waiting took', async () => {
        const ms = await until(
            (delta: number) => delta > 10,
            {
                interval: 1
            }
        )

        expect(ms > 10).toBe(true)
    })
})
