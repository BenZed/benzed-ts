
import {
    nil,
    Pipe,
    Func,
} from '@benzed/util'

import { AnyValidate } from '../validator'

import { AnySchema, SchemaValidate } from './schema'
import { schemaMerge } from './schema-merge'

//// Exports ////

export function schemaUpsert<S extends AnySchema, V extends SchemaValidate<S>>(
    schema: S,
    update: (previous?: V) => V,
    id?: symbol
): S {

    const updatedValidators = Pipe.flatten([schema.validate as AnyValidate])

    const index = id ? updatedValidators.findIndex(v => 'id' in v && v.id === id) : -1
    const isNew = index < 0

    const validator = update(isNew ? updatedValidators[index] as V : nil) as AnyValidate
    if (isNew)
        updatedValidators.push(validator)
    else
        updatedValidators.splice(index, 1, validator)

    return schemaMerge(schema, ...updatedValidators as Func[]) as S
}
