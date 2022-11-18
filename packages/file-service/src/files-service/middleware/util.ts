import path from 'path'

import { MongoDBApplication } from '@benzed/feathers'
import { is } from '@benzed/is'
import match from '@benzed/match'

import { FeathersService } from '@feathersjs/feathers'
import { Middleware, FeathersKoaContext } from '@feathersjs/koa'
import { BadRequest } from '@feathersjs/errors'

import FileService from '../service'
import { File, FilePayload, FileServiceConfig } from '../schema'
import { UPLOAD_QUERY_PARAM } from '../constants'

//// Types ////

interface FileRoutingSettings {

    fs: FileServiceConfig['fs']
    s3: FileServiceConfig['s3']
    path: FileServiceConfig['path']
    method?: 'get' | 'create' | 'update'
    verify: (token: string) => FilePayload | Promise<FilePayload>

}

interface FileMiddlewareSettings extends FileRoutingSettings {
    fs: NonNullable<FileServiceConfig['fs']>
    // s3: S3 
}

type FeathersFileService = FeathersService<MongoDBApplication, FileService>

function assertFileMiddlewareSettings(
    settings: FileRoutingSettings
): asserts settings is FileMiddlewareSettings {

    if (!settings.fs) {
        throw new Error(
            `fs configuration invalid: ${settings.fs}`
        )
    }
}

//// Helper ////

function getCtxFileService(
    ctx: FeathersKoaContext,
    path: string
): FeathersFileService {
    return ctx
        .app
        .service(path) as unknown as FeathersFileService
}

async function getCtxPayload(
    ctx: FeathersKoaContext,
    verify: FileRoutingSettings['verify']
): Promise<FilePayload | null> {

    const uploadToken = ctx.query[UPLOAD_QUERY_PARAM]

    const payload = is.string(uploadToken)
        ? await verify(uploadToken)
        : null

    return payload
}

function getFsFilePath(
    file: Pick<File, '_id' | 'name' | 'ext'>,
    dir: string
): string {
    return path.join(
        dir, 
        file._id, 
        file.name + file.ext
    )
}

export function throwInvalidPayload(): never {
    throw new BadRequest('Invalid file upload payload.')
}

export async function validatePayload(
    files: FeathersFileService,
    payload: FilePayload
): Promise<File> {

    const file = await files.get(payload.file)
    if (file.uploader !== payload.uploader)
        throwInvalidPayload()

    if (file.uploaded)
        throw new BadRequest('File upload is already completed.')

    return file
}

//// Main ////

function createFileRoutingMiddleware(
    create: (settings: FileMiddlewareSettings) => Middleware    
): (settings: FileRoutingSettings) => Middleware {
    return settings => {

        assertFileMiddlewareSettings(settings)

        const middleware = create(settings)

        const [method] = match(settings.method)
        ('get', 'GET')
        ('update', 'PUT')
        ('create', 'POST')
        (undefined)

        return async (ctx, toServiceRoutes) => {
   
            const { path } = settings
            
            const isRouteMatch = path === ctx.path && (!method || method === ctx.method)
            if (isRouteMatch) 
                await middleware(ctx, toServiceRoutes)

            if (ctx.body === undefined)
                await toServiceRoutes()
        }
    }
}

//// Exports ////

export {
    createFileRoutingMiddleware,
    FileRoutingSettings,

    FeathersFileService,

    getCtxFileService,
    getCtxPayload,
    getFsFilePath
}