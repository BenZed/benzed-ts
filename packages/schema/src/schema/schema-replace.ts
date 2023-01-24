
import {
    assign,
    Pipe,
    InputOf,
    OutputOf,
} from '@benzed/util'

import { Validate } from '../validator'
import { AnySchema } from './schema'

//// Exports ////

export function schemaReplace<S extends AnySchema, V extends Validate<InputOf<S>, OutputOf<S>>>(
    schema: S, 
    validate: V
): S {
    const clone = schema.copy()
    assign(clone, { validate: Pipe.from(validate as Validate<unknown>) })
    return clone
}
