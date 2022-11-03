import match from './match'

it('create an iterable match for a value', () => {

    const [ one ] = match(1)
        .case(1, 'one')
        .case(2, 'two')
        .case(3, 'three')
        .default( 'four')

    expect(one).toEqual('one')
})

it('create an iterable match for a set of values', () => {

    const [ one, two, three, four ] = match(1, 2, 3, 4)
        .case(1, 'one')
        .case(2, 'two')
        .case(3, 'three')
        .default( 'four')

    expect([ one, two, three, four ]).toEqual([ 'one', 'two', 'three', 'four' ])
})

