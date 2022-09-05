import { isFunction } from '@benzed/is'

/*** Exports ***/

export default class ValidationError extends Error {

    public constructor (
        msgOrFormat: string | ((path: readonly (string | number)[]) => string),
        public readonly path: readonly (string | number)[]
    ) {

        const message = isFunction(msgOrFormat)
            ? msgOrFormat(path)
            : msgOrFormat

        super(message)
    }

}

