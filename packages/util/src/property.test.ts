import { Property } from './property'

it('property.keysOf()', () => {
    expect(Property.namesOf(
        { foo: true }, 
        { bar: 'cake' }, 
        { [Symbol('ace')]: true, bar: 100 }, 
        { base: 'case', foo: 100 })
    ).toEqual(['foo', 'bar', 'base']) // unique string names
})