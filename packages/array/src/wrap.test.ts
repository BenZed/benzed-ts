import wrap from './wrap'

it('ensures an input is an array', () => {

    expect(wrap(5)).toBeInstanceOf(Array)
    expect(wrap(5)).toEqual([5])
})

it('returns the input if it is an array', () => {

    const arr = [1]

    expect(wrap(arr)).toEqual(arr)
    expect(wrap(arr) === arr).toBe(true)
})
