import { memoize, returns } from './common'

it(`memoize()`, () => {

    let calls = 0 

    const add = (a:number,b: number): number => {
        calls++
        return a + b
    }

    const memoAdd = memoize(add)

    expect(memoAdd(5, 5)).toEqual(10)
    expect(memoAdd(5,5)).toEqual(10)
    expect(calls).toEqual(1)

    expect(memoAdd(10,10)).toEqual(20)
    expect(memoAdd(10,10)).toEqual(20)
    expect(calls).toEqual(2)
})

it(`returns()`, () => {

    const toFoo = returns(`foo`)

    expect(toFoo()).toEqual(`foo`)
    expect(returns(`foo`)).toEqual(toFoo)

})