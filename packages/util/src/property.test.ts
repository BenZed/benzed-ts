import { property } from './property'

it('property.keysOf()', () => {
    expect(property.keysOf(
        { foo: true }, 
        { bar: 'cake' }, 
        { [Symbol('ace')]: true, bar: 100 }, 
        { base: 'case', foo: 100 })
    ).toEqual(['foo', 'bar', 'base']) // unique string names
})