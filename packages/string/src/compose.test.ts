import { words, lines } from './compose'

describe('words', () => {
    it('joins strings separated by spaces', () => {
        expect(words('Hello', 'world!')).toBe('Hello world!')
        expect(words('', 'world!')).toBe('world!')
        expect(words('Hello')).toBe('Hello')
    })
})

describe('lines', () => {
    it('joins strings separated by newlines', () => {
        expect(lines('Hello', 'world!')).toBe('Hello\nworld!')
        expect(lines('', 'world!')).toBe('world!')
        expect(lines('Hello')).toBe('Hello')
    })
})
