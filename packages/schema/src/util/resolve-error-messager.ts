
/*** Type ***/

type ErrorMessager<T = unknown> = (input: T, detail: string) => string

const defaultFailMessager = <T>(input: T, detail: string): string =>
    `"${input}" must be ${detail}`

/*** Main ***/

function resolveErrorMessager<T>(
    input?: string | ErrorMessager<T>,
    _default = defaultFailMessager
): ErrorMessager<T> {

    const errorMessager = typeof input === 'function'
        ? input
        : typeof input === 'string'
            ? () => input
            : _default

    return errorMessager
}

/*** Exports ***/

export default resolveErrorMessager

export {
    resolveErrorMessager,
    ErrorMessager
}