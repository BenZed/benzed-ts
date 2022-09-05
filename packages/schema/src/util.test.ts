import ValidationError from './util/validation-error'

/*** Exports ***/

export function expectValidationError(func: () => unknown): ReturnType<typeof expect> {

    let error
    try {
        func()
    } catch (e) {
        error = e
    }

    expect(error).toHaveProperty('name', ValidationError.name)
    expect(error).toHaveProperty('path')

    return expect(error)
}