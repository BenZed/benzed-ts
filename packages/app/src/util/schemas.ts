import $, { SchemaFor, Schematic } from '@benzed/schema'
import { isFunc, isObject } from '@benzed/util'

type ShapeSchemaInput<T> = {
    [K in keyof T]: SchemaFor<T[K]>
}

export type SchemaHook<T extends object> = Schematic<T> | ShapeSchemaInput<T>

export const isSchematic = <T extends object> (input: unknown): input is SchemaHook<T> => 
    isObject<Partial<Schematic<T>>>(input) && 
    isFunc(input.validate) && 
    isFunc(input.assert) && 
    isFunc(input.is)

export const toSchematic = <T extends object> (input: SchemaHook<T>): Schematic<T> => 
    (isSchematic(input) ? input : $(input)) as Schematic<T>

export const $port = $.integer.range({ 
    min: 1025, 
    comparator: '...', 
    max: 65536
})

