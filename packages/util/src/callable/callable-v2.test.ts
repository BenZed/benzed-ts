import { Func } from '../types'
import { Callable } from './callable-v2'

it('is abstract', () => {
    // @ts-expect-error Abstract
    void new Callable((i: number) => i)
})

it('create instances with call signatures', () => {

    class Formatter<S extends string> extends Callable<(i: string) => S> { }

    const format = new Formatter(i => `${i}!` as `${string}!`)
    const hi = format('hi')
    expect(hi).toEqual('hi!')
})

it('instances have instance properties', () => {

    class Multiply extends Callable<(i: number) => number> {
        constructor(public by: number) {
            super(i => i * this.by)
        }
    }

    const x2 = new Multiply(2)
    expect(x2.by).toBe(2)
    expect(x2(2)).toEqual(4)

    x2.by = 5
    expect(x2(5)).toEqual(25)
})

it('instanceof', () => {

    class Foo extends Callable<Func> {}

    const foo = new Foo(parseInt)
    expect(foo).toBeInstanceOf(Foo)
    expect(foo).toBeInstanceOf(Function)

    class Bar extends Foo {}

    const bar = new Bar(parseFloat)
    expect(bar).toBeInstanceOf(Bar)
    expect(bar).toBeInstanceOf(Foo)
    expect(bar).toBeInstanceOf(Function)

    expect({} instanceof Bar).toBe(false)
    expect(function() { /**/ } instanceof Bar).toBe(false)
    expect((null as unknown) instanceof Bar).toBe(false)
    expect((NaN as unknown) instanceof Bar).toBe(false)
    expect({} instanceof Bar).toBe(false)
})