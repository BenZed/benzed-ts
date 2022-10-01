
import { $querySyntax } from '@benzed/feathers'
import $, { Infer } from '@benzed/schema'

/* eslint-disable
    @typescript-eslint/no-empty-interface
*/

/*** File Schemas ***/

export type FileData = Infer<typeof $fileData>
export const $fileData = $({
    name: $.string(),

    uploader: $.string(),
    uploaded: $.number().round(1).range('>=',0),

    size: $.number().round(1).range('>',0),

    ext: $.string(),
    mime: $.string(),

    created: $.date(),
    updated: $.date(),
})

export type File = Infer<typeof $file>
export const $file = $({
    _id: $.string(),

    ...$fileData.$
})

export type FilePatchData = Infer<typeof $filePatchData>
export const $filePatchData = $({
    uploaded: $file.$.uploaded
} as const)

export type FileCreateData = Infer<typeof $fileCreateData>
export const $fileCreateData = $({
    name: $file.$.name,
    uploader: $file.$.uploader,
    size: $file.$.size
})

/*** File Query ***/

export const $fileQuery = $querySyntax($fileData.$)

export type FileQuery = Infer<typeof $fileQuery>