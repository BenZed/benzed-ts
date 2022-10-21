import seconds from './seconds'

describe(`seconds`, () => {

    it(`returns a promise`, () => {
        expect(seconds(0)).toBeInstanceOf(Promise)
    })

    it(`resolves after a set number of seconds`, async () => {
        const start = Date.now()
        await seconds(0.015)
        const time = Date.now() - start
        expect(time >= 15).toBe(true)
    })

})
