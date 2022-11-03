import match from './match'

const match1to3 = match
    .case(1, 'one')
    .case(2, 'two')
    .default('three')

it('create a match', () => {
    expect(match1to3(1)).toEqual('one')
})

it('cannot iterate through a regular match', () => {

    expect(() => {
        // @ts-expect-error can't iterate
        for (const value of match1to3)
            void value
    }).toThrow('Match is not iterable')
})