import { isFunction } from '@benzed/is'

/*** Exports ***/

export default class ValidationError extends Error {

    constructor (
        msgOrFormat: string | ((path: readonly (string | number)[]) => string),
        readonly path: readonly (string | number)[],
        readonly value: unknown
    ) {

        const message = isFunction(msgOrFormat)
            ? msgOrFormat(path)
            : msgOrFormat

        super(message)

        this.name = `ValidationError`

    }
}

export {
    ValidationError
}