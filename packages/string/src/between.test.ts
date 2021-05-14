import between from './between'

/*** Tests ***/

const str = '{one}, (two), [three], |four|, <!--five-->, <SIX/>'

it('returns the content between and open and closing delimeter', () => {
    expect(between(str, '[', ']')).toBe('[three]')
})

it('close delimeter is same as open delimeter if not provided', () => {
    expect(between(str, '|')).toBe('|four|')
})

it('handles long delimiters', () => {
    expect(between(str, '<!--', '-->')).toBe('<!--five-->')
})

it('returns " if open delimiter can\'t be found', () => {
    expect(between(str, '#')).toBe('')
})

it('returns "" if close delimiter can\'t be found', () => {
    expect(between(str, '<', '!>')).toBe('')
})

it('throws if delimeters are empty strings', () => {
    expect(() => between(str, '')).toThrow('delimeters must not be empty')
    expect(() => between(str, '<', '')).toThrow('delimeters must not be empty')
})

