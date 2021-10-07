import { isFunction } from '@benzed/is'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

/*** Exports ***/

export default abstract class ValidationError extends Error {

    public constructor(
        msgOrFormat: string | ((...args: any[]) => string),
        ...args: any[]
    ) {

        const message = isFunction(msgOrFormat)
            ? msgOrFormat(...args)
            : msgOrFormat

        super(message)
    }

}

