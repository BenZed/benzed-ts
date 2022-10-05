import { basename as baseNameOf, extname as extOf } from 'path'
import { getType as getMimeType } from 'mime'

import { resolve, timestamp } from '@benzed/feathers'

import {

    // FileData,
    File,
    FileQuery,

    $file,
    // $fileData,
    $filePatchData,
    $fileQuery,
    $fileCreateData,
    FileData,

} from './schema'

import type { FileServerHookContext } from '../../create-file-server-app'
import type { FileService } from './index'

/*
    eslint-disable require-await
*/

/*** Constants ***/

const DEFAULT_MIME_TYPE = 'application/octet-stream'

/*** Types ***/

type FileServiceHookContext = FileServerHookContext<FileService>

/*** Exports ***/

export const filePatchResolver = resolve<File, FileServiceHookContext>({
    schema: $filePatchData,
    validate: 'before',
    properties: {

        updated: timestamp

    }
})

export const fileCreateResolver = resolve<FileData & { urls: string[] }, FileServiceHookContext>({
    schema: $fileCreateData,
    validate: 'before',
    properties: {

        updated: timestamp,
        created: timestamp,

        uploaded: async () => false,

        // name without ext
        name: async (fileName) => fileName && baseNameOf(fileName, extOf(fileName)),

        // ext from name
        ext: async (_, file) => extOf(file.name),

        // mime type from ext
        type: async (_, file) => getMimeType(baseNameOf(file.name)) ?? DEFAULT_MIME_TYPE

    }
})

// Resolver for the data that is being returned
export const fileResolver = resolve<File, FileServiceHookContext>({
    schema: $file,
    validate: false,
    properties: {
        _id: async id => id?.toString()
    }
})

// Resolver for the "safe" version that external clients are allowed to see
export const fileDispatchResolver = resolve<File, FileServiceHookContext>({
    schema: $file,
    validate: false,
    properties: {
        ...fileResolver.options.properties
    }
})

// Resolver for allowed query properties
export const fileQueryResolver = resolve<FileQuery, FileServiceHookContext>({
    schema: $fileQuery,
    validate: 'before',
    properties: {
        //
    }
})

// Export all resolvers in a format that can be used with the resolveAll hook
const fileResolveAll = {
    result: fileResolver,
    dispatch: fileDispatchResolver,
    data: {
        create: fileCreateResolver,
        update: filePatchResolver,
        patch: filePatchResolver
    },
    query: fileQueryResolver
}

export default fileResolveAll