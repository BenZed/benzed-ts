import { define } from './define'

it('define.namesOf()', () => {
    expect(define.namesOf(
        { foo: true }, 
        { bar: 'cake' }, 
        { [Symbol('ace')]: true, bar: 100 }, 
        { base: 'case', foo: 100 })
    ).toEqual(['foo', 'bar', 'base']) // unique string names
})