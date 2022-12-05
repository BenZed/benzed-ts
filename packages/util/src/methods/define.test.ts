import { define } from './define'

it('define.keysOf()', () => {
    expect(define.keysOf(
        { foo: true }, 
        { bar: 'cake' }, 
        { [Symbol('ace')]: true, bar: 100 }, 
        { base: 'case', foo: 100 })
    ).toEqual(['foo', 'bar', 'base']) // unique string names
})