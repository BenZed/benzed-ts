import { isString, String } from '../schema'
import { Is } from './is'

//// Setup ////

const isStringRef = new Is(isString)

//// Tests ////

it('wraps other schematics', () => {
    expect(isStringRef.ref).toBeInstanceOf(String)
})

it('inherits other schematics methods', () => {
    expect(isStringRef('')).toBe(true)
    expect(isStringRef(0)).toBe(false)
    expect(isStringRef.startsWith).toBeInstanceOf(Function)
})

it('schematic methods that return a schematic are re-wrapped in Is', () => {
    const isHash = isStringRef.startsWith('#')
    expect(isHash).toBeInstanceOf(Is)
    expect(isHash('#hello')).toBe(true)
    expect(isHash('')).toBe(false)
})