
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
import { FileRoutingSettings, throwInvalidPayload } from './middleware/util'

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

    const { path, pagination, fs, s3 } = config 

    const { sign, verify } = createSignAndVerify(auth)

    const collection = app.db(
        // '/files' -> 'files'
        path.replace('/', '')
    ) 

    const middleware = { verify, path, fs, s3 }

    app.use(
        path, 
        new FileService({
            path,
            sign,
            paginate: pagination,
            multi: false,
            Model: collection
        }),
        {
            koa: {
                before: [
                    errorHandler(),
                    uploadPart({ ...middleware, method: 'update'}),
                    uploadComplete({ ...middleware, method: 'create'}),
                    serve({ ...middleware, method: 'get' })
                ]
            },
            methods: ['create', 'find', 'get', 'patch', 'remove'],
            events: [],
        }
    )

    const fileService = app.service(path) as unknown as FeathersService<A, FileService>
    return fileService.hooks(fileHooks)
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