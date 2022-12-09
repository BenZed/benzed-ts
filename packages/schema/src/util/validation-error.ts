import { is } from '@benzed/is'
import { isString } from '@benzed/util'

//// Helper ////

function formatPath (path: readonly (string | number | symbol)[]): string {
    return path.map((p,i) => i === 0 ? String(p) : isString(p) ? `.${p}` : `[${String(p)}]`).join('')
}

//// Exports ////

export default class ValidationError extends Error {

    constructor (
        msgOrFormat: string | ((path: readonly (string | number)[]) => string),
        readonly path: readonly (string | number)[],
        readonly value: unknown
    ) {

        const message = is.function(msgOrFormat)
            ? msgOrFormat(path)
            : msgOrFormat

        super(`${formatPath(path)} ${message}`.trim())

        this.name = 'ValidationError'

    }
}

export {
    ValidationError
}