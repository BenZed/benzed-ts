import { Validator } from './types'

/*** Main ***/

function optional<T>(
    validator: Validator<T>
): Validator<T | undefined> {

    return (input: unknown): input is T | undefined =>
        input === undefined || validator(input)
}

/*** Exports ***/

export default optional

export {
    optional,
    optional as orUndefined
}