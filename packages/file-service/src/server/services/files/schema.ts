
import { Id, IdType, schema, Infer, queryProperty } from '@benzed/feathers'

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
        properties: {
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
        },
    } as const)

export interface FileData extends Infer<typeof FileSchema> {
    ext: string
    mime: string

    created: number
    updated: number
}
export type File<I extends IdType> = FileData & Id<I>

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
        uploaded: FileSchema.properties.uploaded
    }
} as const)

export type FileCreateData = Infer<typeof FileCreateDataSchema>
export const FileCreateDataSchema = schema({
    $id: 'FileCreateData',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'uploader', 'size'],
    properties: {
        name: FileSchema.properties.name,
        uploader: FileSchema.properties.uploader,
        size: FileSchema.properties.size
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

        name: queryProperty(FileSchema.properties.name),
        uploader: queryProperty(FileSchema.properties.uploader),
        ext: queryProperty({ type: 'string' }),
        mime: queryProperty({ type: 'string' }),
        size: queryProperty(FileSchema.properties.size),
        uploaded: queryProperty(FileSchema.properties.uploaded),

        created: queryProperty({ type: 'integer', minimum: 0 }),
        updated: queryProperty({ type: 'integer', minimum: 0 }),
    }
} as const)

export type FileQuery = Infer<typeof FileQuerySchema>