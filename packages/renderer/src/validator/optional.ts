
/*** Main ***/

function optional<T>(
    validator: (input: unknown) => input is T
): (input: unknown) => input is T | undefined {

    return (input: unknown): input is T | undefined =>
        input === undefined || validator(input)
}

/*** Exports ***/

export default optional

export {
    optional,
    optional as orUndefined
}