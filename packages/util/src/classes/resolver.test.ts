import { Resolver, resolve } from './resolver'

import { it, expect } from '@jest/globals'

//// Tests ////

const x2Sync = (i: number): number => i * 2
const x2Async = (i: number): Promise<number> => Promise.resolve(i * 2)

let i = 1

const detail = (i: boolean): string => i ? 'async' : 'sync'

for (const from of [true, false]) {
    for (const then of [true, false]) {

        const title = `${detail(from)} value to ${detail(then)} method`

        it(title, async () => {

            const number = i++ 

            const value = from ? Promise.resolve(number): number
            const func = then ? x2Async : x2Sync
    
            const resolver = new Resolver(value).then(func) 
    
            const awaited = await resolver
            const sync = resolver.output
             
            expect(awaited).toEqual(x2Sync(number))

            if (then || from)
                await expect(sync).resolves.toEqual(awaited)
            else 
                expect(sync).toEqual(awaited)
        })
    }
}

it('arguments', () => {
    
    const toCap = (input: string, capitalize?: boolean): string => capitalize ? input.toUpperCase() : input

    expect(resolve('hello')(toCap).value).toEqual('hello')
    expect(resolve('hello')(toCap, false).value).toEqual('hello')
    expect(resolve('hello')(toCap, true).value).toEqual('HELLO')
})