import match from './match'

it('allows you to match one set of values to another', () => {

    const match1to4 = match(1, 2, 3, 4)
        .case(1, 'one')
        .case(2, 'two')
        .case(3, 'three')
        .case(4, 'four')

    const [ out1 ] = match1to4
    expect(out1).toEqual('one')

    const out2 = match1to4(4)
    console.log(match1to4.cases)

    console.log(match(10))
})