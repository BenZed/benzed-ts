import { isObject } from '@benzed/is/src/is-basic'
import { defined } from '@benzed/util/src'
import { ValidationError } from '@benzed/schema/src'

import { HttpCode } from '../../util'

interface CommandErrorJson {

    readonly code: HttpCode
    readonly name: string
    readonly message: string

    readonly data: object
}

//// Main ////

class CommandError extends Error {
    
    static from(input: unknown, def?: { code?: HttpCode, message?: string, data?: object }): CommandError {

        // auto wrap validation errors
        const error: Partial<CommandErrorJson> = input instanceof ValidationError 
            ? {
                ...input,
                code: HttpCode.BadRequest,
                data: {
                    path: input.path,
                    value: input.value
                }
            }

            // wrap any old error
            : isObject(input)
                ? input 
                // stringify whatever remains
                : { message: String(input) }

        const {
            code = def?.code ?? HttpCode.InternalServerError,
            message = def?.message ?? 'Command failed.',
            data
        } = error
        return new CommandError(
            code,
            message,
            {
                ...def?.data,
                ...data,
            }
        )
    }

    readonly code: HttpCode

    constructor(
        code: HttpCode, 
        msg: string, 
        readonly data?: object
    ) {
        super(msg)
        this.code = code
        this.name = HttpCode[code]
    }

    toJSON(): CommandErrorJson {
        const { code, name, message, data } = this 
        return {
            code,
            name,
            message,
            data: defined(data ?? {})
        }
    }
}

//// Exports ////

export default CommandError

export {
    CommandError,
    CommandErrorJson
}