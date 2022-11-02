import match from './match'

it('match a value', () => {

    const [ one ] = match(1)
        .case(1, 'one')
        .case(2, 'two')
        .case(3, 'three')
        .case(4, 'four')

    expect(one).toEqual('one')
})

it('match a set of values', () => {

    const [ one, two, three, four ] = match(1, 2, 3, 4)
        .case(1, 'one')
        .case(2, 'two')
        .case(3, 'three')
        .case(4, 'four')

    expect([ one, two, three, four ]).toEqual([ 'one', 'two', 'three', 'four' ])
})

it('match', () => {

    const match1to3 = match
        .case(1, 'one')
        .case(2, 'two')
        .case(3, 'three')

    console.log(match1to3(1))
})