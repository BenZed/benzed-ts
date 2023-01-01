import { isObject, defined, omit } from '@benzed/util'
import { ValidationError } from '@benzed/schema'

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
                message: input.message,
                code: HttpCode.BadRequest,
                data: {
                    ...omit(input, 'name', 'message')
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