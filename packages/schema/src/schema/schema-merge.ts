
import {

    AnyValidate,
    ValidateOutput,
    Validator,

} from '../validator'

import { AnySchema, SchemaValidate } from './schema'
import { schemaReplace } from './schema-replace'

////  ////

export function schemaMerge<S extends AnySchema, V extends SchemaValidate<ValidateOutput<S>>[]>(
    schema: S, 
    ...validators: V
): S {
    const validate = Validator.merge(
        schema.validate as AnyValidate,
        ...validators as AnyValidate[] as []
    )
    return schemaReplace(schema, validate)
}
