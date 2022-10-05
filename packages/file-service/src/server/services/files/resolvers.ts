import { resolve, timestamp } from '@benzed/feathers'

import {

    // FileData,
    FilePatchData,
    File,
    FileQuery,

    $file,
    // $fileData,
    $filePatchData,
    $fileQuery,
    $fileCreateData,
    FileCreateData,
    FileData,

} from './schema'

import type { FileServerHookContext } from '../../create-file-server-app'
import type { FileService } from './index'
import { basename as nameOf, extname as extOf } from 'path'
import mime from 'mime'

/*
    eslint-disable require-await
*/

const DEFAULT_MIME_TYPE = 'application/octet-stream'

// this is only here to shut ts up about it

type FileServiceHookContext = FileServerHookContext<FileService>

// Resolver for the basic data model (e.g. creating new entries)

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

        // name without extension
        name: async (value) => value && nameOf(value, extOf(value)),

        // extension from name
        ext: async (_, file) => extOf(file.name),

        // mime type from extension
        mime: async (_, file) => mime.getType(nameOf(file.name)) ?? DEFAULT_MIME_TYPE,

        urls: async (_) => ['go']
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
const filesResolvers = {
    result: fileResolver,
    dispatch: fileDispatchResolver,
    data: {
        create: fileCreateResolver,
        update: filePatchResolver,
        patch: filePatchResolver
    },
    query: fileQueryResolver
}

export default filesResolvers