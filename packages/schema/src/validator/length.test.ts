import LengthValidator from './length'

it('is a range comparator for objects with length', () => {

    const nonEmpty = new LengthValidator({
        comparator: '>',
        value: 0,
        error: 'Cannot be empty.'
    })

    expect(() => nonEmpty.validate([])).toThrow('Cannot be empty.')
    expect(nonEmpty.validate([1])).toEqual([1])
})

it('throws on configurations that compare lengths below zero', () => {
    expect(() => new LengthValidator({ value: -1, comparator: '<' }))
        .toThrow('cannot validate length below 0')
})

it('throws on configurations that do not use integers', () => {

    expect(() => new LengthValidator({ value: 1.5, comparator: '<' }))
        .toThrow('value must be an integer')

    expect(() => new LengthValidator({ min: 1.5, max: 5 }))
        .toThrow('min must be an integer')

    expect(() => new LengthValidator({ min: 1, max: 5.5 }))
        .toThrow('max must be an integer')
})