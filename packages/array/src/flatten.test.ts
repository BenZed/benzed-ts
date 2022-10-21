import flatten from './flatten'

// eslint-disable-next-line no-unused-vars

it(`flattens arrays`, () => {
    expect(flatten([1, [2], [3, [4]]]))
        .toEqual([1, 2, 3, 4])
})

