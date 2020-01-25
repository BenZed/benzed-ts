import unwrap from './unwrap'

it('ensures an input is not an array', () => {
    const obj = {}

    expect(unwrap([obj])).toEqual(obj)
})

it('returns the input if it is not an array', () => {

    const obj = {}

    expect(unwrap(obj)).toEqual(obj)
})
