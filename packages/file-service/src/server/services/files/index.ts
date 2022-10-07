
import { 
    MongoDBApplication
} from '@benzed/feathers'

import { 
    FeathersService
} from '@feathersjs/feathers'

import type { AuthenticationService } from '../authentication'

import * as fileHooks from './hooks'
import { 
    createFileRoutingMiddleware,
    FileRoutingMiddlewareSettings 
} from './middleware/file-routing'

import { FileServiceConfig, FilePayload, $filePayload } from './schema'
import { FileService, FileParams, FileServiceSettings } from './service'

/*** Helper ***/

function encodeBase64Payload(payload: FilePayload): string {

    const stringified = JSON.stringify(payload)
    const buffer = Buffer.from(stringified)
    return buffer.toString('base64')
}

function decodeBase64Payload(token: string): FilePayload {

    const stringified = Buffer.from(token, 'base64').toString()
    const payload = JSON.parse(stringified)
    return $filePayload.validate(payload)
}

function createSignAndVerify(
    auth?: AuthenticationService
): { 
        sign: FileServiceSettings['sign']
        verify: FileRoutingMiddlewareSettings['verify']
    } {

    return auth 
        ? {
            sign: payload => auth.createAccessToken(payload),
            verify: token => auth.verifyAccessToken(token).then($filePayload.validate)
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

    app.use(

        path, 
        
        new FileService({

            path,
            sign,

            paginate: pagination,
            multi: false,

            Model: app.db(
                path.replace('/', '') // '/files' -> 'files'
            )

        }),
        
        {
            methods: ['create', 'find', 'get', 'patch', 'remove'],
            events: [],
            koa: {
                before: [
                    createFileRoutingMiddleware({ verify, path, fs, s3 })
                ]
            }
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