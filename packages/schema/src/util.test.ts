import { ValidationError } from './validator/error'

/* eslint-disable @typescript-eslint/no-explicit-any */

//// Exports ////

export function expectValidationError(func: () => unknown): ReturnType<typeof expect> {

    let error: unknown
    try {
        func()
    } catch (e) {
        error = e
    }

    expect(error).toHaveProperty('name', ValidationError.name)
    expect(error).toHaveProperty('path')

    return expect(error)
}
