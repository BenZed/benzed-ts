import by from './sort'

test('sorts numbers by value', () => {
    const input = [4, 2, 7, 1, 6]
    const expected = [1, 2, 4, 6, 7]

    const output = input.sort(by())

    expect(output).toEqual(expected)
})

test('sorts strings', () => {
    const input = ['apple', 'pear', 'banana', 'orange']
    const expected = ['apple', 'banana', 'orange', 'pear']

    const output = input.sort(by())

    expect(output).toEqual(expected)
})

test('sorts an array of objects by a given key', () => {
    const input = [ { id: 4, name: 'apple' }, { id: 2, name: 'pear' }, { id: 7, name: 'banana' }, { id: 1, name: 'orange' } ]

    const expected = [ { id: 1, name: 'orange' }, { id: 2, name: 'pear' }, { id: 4, name: 'apple' }, { id: 7, name: 'banana' } ]

    const output = input.sort(by('id'))

    expect(output).toEqual(expected)
})

test('sorts an array of objects by a transform function', () => {
    const input = [ { name: 'apple' }, { name: 'pear' }, { name: 'banana' }, { name: 'kiwi' } ]
    const expected = [ { name: 'banana' }, { name: 'apple' }, { name: 'kiwi' }, { name: 'pear' }]
    //                           by reverse name order
    const output = input.sort(by(o => o.name.split('').reverse().join('')))

    expect(output).toEqual(expected)
})

test('sorts an array of objects by multiple criteria', () => {
    const people = [
        { name: 'Alice', age: 35 },
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 30 },
    ]
      
    const sorted = people.sort(by('age', 'name'))
      
    expect(sorted).toEqual([
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 35 },
    ])
})
