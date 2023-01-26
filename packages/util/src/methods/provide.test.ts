
import { provide } from './provide'

it('provides a context to a function', () => { 

    const f = provide({ by: 5 }, ctx => (i: number) => i * ctx.by)
 
    expect(f(2)).toEqual(10)
})

it('is memoized', () => {

    const state: number[] = []

    const providePush = (s: number[]) => (i: number) => s.push(i)

    const push1 = provide(state, providePush)
    const push2 = provide(state, providePush)

    expect(push1).toBe(push2)
    push1(1)
    push2(2)
 
    expect(state).toEqual([1,2]) 

    const push3 = provide([], providePush)
    expect(push3).not.toBe(push2)
    push3(3)
    expect(state).toEqual([1,2])
})