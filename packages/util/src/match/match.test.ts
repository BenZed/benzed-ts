import addCase from './match'

it('create a match for a value', () => {

    const [ one ] = addCase(1)
        .case(1, 'one')
        .case(2, 'two')
        .case(3, 'three')
        .case(4, 'four')

    expect(one).toEqual('one')
})

it('create a match for a set of values', () => {

    const [ one, two, three, four ] = addCase(1, 2, 3, 4)
        .case(1, 'one')
        .case(2, 'two')
        .case(3, 'three')
        .case(4, 'four')

    expect([ one, two, three, four ]).toEqual([ 'one', 'two', 'three', 'four' ])
})

it('create a match for a', () => {

    const match1to3 = addCase
        .case(1, 'one')
        .case(2, 'two')
        .case(3, 'three')

    expect(match1to3(1)).toEqual('one')
})