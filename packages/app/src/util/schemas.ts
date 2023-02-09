import $, { SchemaFor, Schematic } from '@benzed/schema'
import { isFunc, isRecord } from '@benzed/util'

import { path } from './types'

//// Schema Helpers ////

type ShapeSchemaInput<T extends object> = {
    [K in keyof T]: Schematic<T[K]>
} 

export type SchemaHook<T extends object = object> = Schematic<T> | ShapeSchemaInput<T>

export const isSchematic = <T extends object> (input: unknown): input is SchemaHook<T> => 
    isRecord<Partial<Schematic<T>>>(input) && 
    isFunc(input.validate) && 
    isFunc(input.assert) && 
    isFunc(input.is)

export const toSchematic = <T extends object> (input: SchemaHook<T>): Schematic<T> => 
    (isSchematic(input) ? input : $(input)) as Schematic<T>

//// Schemas ////

export const $port = $.integer.range({ 
    min: 1025, 
    comparator: '...', 
    max: 65536
})

export const $path = $.string
    .trim()
    .validates(
        s => s.startsWith('/') ? s : '/' + s,
        'Must start with a "/"'
    )
    .validates(
        s => s.replace(/\/+/g, '/'), 
        'Must not have multiple consecutive "/"s'
    ) 
    .validates(
        s => s.replace(/\/$/, '') || '/',
        //                                                      ^ in case we just removed the only slash
        'Must not end with a "/"'
    ) as SchemaFor<path>
    