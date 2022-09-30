
import { Id, IdType, schema } from '@benzed/feathers'
import { Infer, querySyntax } from '@feathersjs/schema'

/* eslint-disable
    @typescript-eslint/no-empty-interface
*/

/*** File Schemas ***/

export const fileSchema = schema({
    $id: 'File',
    type: 'object',
    additionalProperties: false,

    required: [
        'name',
        'uploader',
        'uploaded',
        'size',
        'ext',
        'mime',
        'created',
        'updated'
    ],

    properties: {

        name: {
            type: 'string'
        },

        uploader: {
            type: 'string',
        },

        uploaded: {
            type: 'integer',
            minimum: 0
        },

        size: {
            type: 'integer',
            minimum: 1
        },

        ext: {
            type: 'string'
        },

        mime: {
            type: 'string'
        },

        created: {
            type: 'number'
        },

        updated: {
            type: 'number'
        }

    },
} as const)

const { properties: FILE_PROPERTIES } = fileSchema

export interface FileData extends Infer<typeof fileSchema> {
    /**/
}
export interface File<I extends IdType> extends FileData, Id<I> {
    /**/
}

export type FilePatchData = Infer<typeof filePatchDataSchema>
export const filePatchDataSchema = schema({
    $id: 'FilePatchData',
    type: 'object',
    additionalProperties: false,
    required: ['uploaded'],
    properties: {
        uploaded: FILE_PROPERTIES.uploaded
    }
} as const)

export type FileCreateData = Infer<typeof fileCreateDataSchema>
export const fileCreateDataSchema = schema({
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

export const fileQuerySchema = schema({
    $id: 'FileQuery',
    type: 'object',
    additionalProperties: false,
    properties: querySyntax({
        ...FILE_PROPERTIES
    })

} as const)

export type FileQuery = Infer<typeof fileQuerySchema>