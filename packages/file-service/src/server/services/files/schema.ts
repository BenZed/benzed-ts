
import { Id, IdType, schema, Infer, queryProperty } from '@benzed/feathers'

/*** File Schemas ***/

export const fileSchema = schema({
    $id: 'File',
    type: 'object',
    additionalProperties: false,

    required: ['name', 'uploader', 'size', 'uploaded'],
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

export interface FileData extends Infer<typeof fileSchema> {
    ext: string
    mime: string

    created: number
    updated: number
}
export type File<I extends IdType> = FileData & Id<I>

export type FilePatchData = Infer<typeof filePatchDataSchema>
export const filePatchDataSchema = schema({
    $id: 'FilePatchData',
    type: 'object',
    additionalProperties: false,
    required: ['uploaded'],
    properties: {
        uploaded: fileSchema.properties.uploaded
    }
} as const)

export type FileCreateData = Infer<typeof fileCreateDataSchema>
export const fileCreateDataSchema = schema({
    $id: 'FileCreateData',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'uploader', 'size'],
    properties: {
        name: fileSchema.properties.name,
        uploader: fileSchema.properties.uploader,
        size: fileSchema.properties.size
    }
} as const)

/*** File Query ***/

export const fileQuerySchema = schema({
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

        name: queryProperty(fileSchema.properties.name),
        uploader: queryProperty(fileSchema.properties.uploader),
        ext: queryProperty({ type: 'string' }),
        mime: queryProperty({ type: 'string' }),
        size: queryProperty(fileSchema.properties.size),
        uploaded: queryProperty(fileSchema.properties.uploaded),

        created: queryProperty({ type: 'integer', minimum: 0 }),
        updated: queryProperty({ type: 'integer', minimum: 0 }),
    }
} as const)

export type FileQuery = Infer<typeof fileQuerySchema>