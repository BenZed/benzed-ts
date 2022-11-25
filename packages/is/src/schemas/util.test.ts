import { ValidationError } from '../validator/error'

/* eslint-disable @typescript-eslint/no-explicit-any */

//// Exports ////

export function expectValidationError(func: () => unknown): ReturnType<typeof expect> {

    let error: ValidationError | null = null
    try {
        func()
    } catch (e) {
        error = e
    }

    expect(error).not.toBe(null)
    expect(error).toHaveProperty('name', ValidationError.name)
    expect(error).toHaveProperty('path')

    return expect(error)
}
