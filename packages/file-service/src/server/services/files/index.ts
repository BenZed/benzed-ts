
import { MongoDBApplication } from '@benzed/feathers'

import { FeathersService } from '@feathersjs/feathers'
import { errorHandler } from '@feathersjs/koa'

import type { AuthenticationService } from '../authentication'

import * as fileHooks from './hooks'

import { 
    serveMiddleware as serve, 
    uploadCompleteMiddleware as uploadComplete, 
    uploadPartMiddleware as uploadPart 
} from './middleware'

import { 
    FileRoutingSettings, 
    throwInvalidPayload 
} from './middleware/util'

import { 
    FileServiceConfig, 
    FilePayload, 
    $filePayload 
} from './schema'

import {
    FileService,
    FileParams, 
    FileServiceSettings 
} from './service'

import setupRenderService from './render'

/*** Helper ***/

function encodeBase64Payload(payload: FilePayload): string {

    const stringified = JSON.stringify(payload)
    const buffer = Buffer.from(stringified)
    return buffer.toString('base64')
}

function decodeBase64Payload(token: string): FilePayload {

    try {
        const stringified = Buffer.from(token, 'base64').toString()
        const payload = JSON.parse(stringified)
        return $filePayload.validate(payload)

    } catch {
        throwInvalidPayload()
    }
}

function createSignAndVerify(
    auth?: AuthenticationService
): 
    {
        sign: FileServiceSettings['sign']
        verify: FileRoutingSettings['verify']
    } {

    return auth 
        ? {
            sign: payload => auth.createAccessToken(payload),
            verify: token => auth.verifyAccessToken(token)
                .then($filePayload.validate)
                .catch(throwInvalidPayload)

        } : {
            sign: encodeBase64Payload,
            verify: decodeBase64Payload
        }
}

/*** Main ***/

function setupFileService<A extends MongoDBApplication>(
    
    app: A,
    auth: AuthenticationService,
    config: FileServiceConfig

): FeathersService<A, FileService> {

    const { path, pagination, fs, s3, renderer } = config 

    const { sign, verify } = createSignAndVerify(auth)

    app.use(

        path, 

        new FileService({
            path,
            sign,
            paginate: pagination,
            multi: false,
            Model: app.db(
                // '/files' -> 'files'
                path.replace('/', '')
            ) 
        }),

        {
            koa: {
                before: [
                    errorHandler(),
                    serve({ verify, path, fs, s3, method: 'get' }),
                    uploadPart({ verify, path, fs, s3, method: 'update'}),
                    uploadComplete({ verify, path, fs, s3, method: 'create'})
                ],
                after: [
                    // deleteFileAfterRemoval({ method: 'remove' })
                ]
            },
            methods: ['create', 'find', 'get', 'patch', 'remove'],
            events: [],
        }

    )

    const files = app.service(path) as unknown as FeathersService<A, FileService>
    files.hooks(fileHooks)

    app.log`file service configured`

    if (renderer) {
        setupRenderService(
            app, 
            {
                renderer,
                path: path + '/render'
            }
        )
    }

    return files

}

/*** Exports ***/

export default setupFileService

export {
    FileService,
    FileParams 
}

export * from './hooks'
export * from './middleware'
export * from './schema'
export * from './service'
export * from './resolvers'