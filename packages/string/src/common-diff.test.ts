
import { commonDiff } from './common-diff'

it('splits an array of strings into their commons and differences', () => {

    const input = ['foobar', 'foobaz', 'fooqux']

    const output = commonDiff(input)

    expect(output).toEqual(['foo', 'bar', 'baz', 'qux'])

})

it('handles strings with no differences', () => {

    const input = ['abc', 'def', 'xyz']

    expect(commonDiff(input)).toEqual(['', ...input])

})

it('handles empty strings', () => {

    const input = ['', 'abc', 'abcd']

    expect(commonDiff(input)).toEqual(['', ...input])

})

it('handles empty input', () => {
    expect(commonDiff([])).toEqual([''])
})

it('allows optional offset property', () => {

    const input = ['1-pilot_ace', '2-pilot_maverick', '3-pilot_jimmy']
    const output = ['pilot_', 'ace', 'maverick', 'jimmy']

    expect(commonDiff(input, 2))
        .toEqual(output)

    expect(commonDiff(input, { offset: 2 }))
        .toEqual(output)

})

it('allows optional terminator property', () => {

    const input = ['james@google.com', 'nick@google.com', 'jerry@google.com']

    const output = ['@google.com', 'james', 'nick', 'jerry']

    expect(commonDiff(input, { fromEnd: true })).toEqual(output)
    expect(commonDiff(input, true)).toEqual(output)
})

it('allows both options at once', () => {

    const input = ['james@google.com', 'nick@google.com', 'jerry@google.com']

    const output = ['@google', 'james', 'nick', 'jerry']

    expect(commonDiff(input, { fromEnd: true, offset: 4 })).toEqual(output)
})