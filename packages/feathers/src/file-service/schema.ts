
import { Record } from '../types'
import { schema, Infer, queryProperty } from '../schema'

/**
 * Json description of File properties to be used in other schemas
 */
const FILE_PROPERTIES = {
    name: {
        type: 'string'
    },

    uploader: {
        type: 'string',
    },

    size: {
        type: 'integer',
        minimum: 0
    },

    uploaded: {
        type: ['integer', 'null'],
        minimum: 0
    }
} as const

/*** File Schemas ***/

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createFileSchema = <S extends string, R extends readonly string[]>(
    $id: S,
    required: R
) =>
    schema({
        $id,
        type: 'object',
        additionalProperties: false,

        required,
        properties: FILE_PROPERTIES,
    } as const)

export interface FileData extends Infer<typeof FileSchema> {
    ext: string
    mime: string

    created: number
    updated: number
}
export type File<I = void> = Record<I, FileData>

export const FileSchema = createFileSchema(
    'File',
    [
        'name',
        'uploader',
        'size',
        'uploaded'
    ] as const
)

export type FilePatchData = Infer<typeof FilePatchDataSchema>
export const FilePatchDataSchema = schema({
    $id: 'FilePatchData',
    type: 'object',
    additionalProperties: false,
    required: ['uploaded'],
    properties: {
        uploaded: FILE_PROPERTIES.uploaded
    }
} as const)

export type FileCreateData = Infer<typeof FileCreateDataSchema>
export const FileCreateDataSchema = schema({
    $id: 'FileCreateData',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'uploader', 'size'],
    properties: {
        name: FILE_PROPERTIES.name,
        uploader: FILE_PROPERTIES.uploader,
        size: FILE_PROPERTIES.size
    }
} as const)

/*** File Query ***/

export const FileQuerySchema = schema({
    $id: 'FileQuery',
    type: 'object',
    additionalProperties: false,
    properties: {

        $limit: {
            type: 'integer',
            default: 100,
            minimum: 0,
            maximum: 1000
        },

        $skip: {
            type: 'integer',
            minimum: 0
        },

        _id: queryProperty({ type: 'string' }),

        name: queryProperty(FILE_PROPERTIES.name),
        uploader: queryProperty(FILE_PROPERTIES.uploader),
        ext: queryProperty({ type: 'string' }),
        mime: queryProperty({ type: 'string' }),
        size: queryProperty(FILE_PROPERTIES.size),
        uploaded: queryProperty(FILE_PROPERTIES.uploaded),

        created: queryProperty({ type: 'integer', minimum: 0 }),
        updated: queryProperty({ type: 'integer', minimum: 0 }),
    }
} as const)

export type FileQuery = Infer<typeof FileQuerySchema>