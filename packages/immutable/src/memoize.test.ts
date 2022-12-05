
import memoize from './memoize'

describe('memoize', () => {
    const add = (a: number, b: number): number => {
        addCalls++
        return a + b
    }
    const memoizedAdd = memoize(add)
    let addCalls = 0

    it('returns cached result if arguments are value equal', () => {
        expect(memoizedAdd(3, 7)).toEqual(10)
        expect(addCalls).toEqual(1)

        expect(memoizedAdd(3, 7)).toEqual(10)
        expect(addCalls).toEqual(1)

        expect(memoizedAdd(5, 5)).toEqual(10)
        expect(addCalls).toEqual(2)
    })

    // it('no arguments is also considered value-equal', () => {

    //     const memoizedPrimes = memoize(() => [...primes(2, 50000)])

    //     const timedMemoizedPrimes = (): number => {
    //         const start = Date.now()
    //         memoizedPrimes()
    //         return Date.now() - start
    //     }

    //     expect(
    //         timedMemoizedPrimes() >
    //         timedMemoizedPrimes(),
    //     ).toBeTruthy()
    // })

    it('works asyncronously', async () => {
        const getWaitTime = (time: number): Promise<number> =>
            new Promise(resolve =>
                setTimeout(() => resolve(time), time)
            )

        const memoizedGetWaitTime = memoize(getWaitTime)

        let start = Date.now()
        let wait = await memoizedGetWaitTime(10)
        let time = Date.now() - start

        expect(wait).toEqual(10)
        expect(time).toBeGreaterThan(9)

        start = Date.now()
        wait = await memoizedGetWaitTime(10)
        time = Date.now() - start

        expect(wait).toEqual(10)
        // proves that awaiting didn't happen twice
        expect(time).toBeLessThanOrEqual(9)

    })

    it('optionally takes a maxCacheSize argument', () => {
        let sideEffects = 0
        const expensiveOperationThatJustReturnsInput = memoize((input: number) => {
            sideEffects++
            return input
        }, 1)

        expect(expensiveOperationThatJustReturnsInput(1)).toEqual(1)
        expect(sideEffects).toEqual(1)

        // proves that function is using cached result, since no side sideEffect
        // is not being touched
        expect(expensiveOperationThatJustReturnsInput(1)).toEqual(1)
        expect(sideEffects).toEqual(1)

        expect(expensiveOperationThatJustReturnsInput(2)).toEqual(2)
        expect(sideEffects).toEqual(2)

        // even though 0 was once cached, it's result has been discarded, because the
        // max cache size is 1
        expect(expensiveOperationThatJustReturnsInput(1)).toEqual(1)
        expect(sideEffects).toEqual(3)
    })
})