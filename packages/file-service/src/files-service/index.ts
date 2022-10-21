
import { MongoDBApplication, resolveAll } from '@benzed/feathers'
import { authenticate, AuthenticationService } from '@feathersjs/authentication'

import { FeathersService } from '@feathersjs/feathers'
import { errorHandler } from '@feathersjs/koa'

import { 
    serveMiddleware as serve, 
    uploadCompleteMiddleware as uploadComplete, 
    uploadPartMiddleware as uploadPart 
} from './middleware'

import { 
    FileRoutingSettings, 
    throwInvalidPayload 
} from './middleware/util'
import fileResolveAll from './resolvers'

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
    return buffer.toString(`base64`)
}

function decodeBase64Payload(token: string): FilePayload {

    try {
        const stringified = Buffer.from(token, `base64`).toString()
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
    setingsAndRefs: FileServiceConfig & {
        app: A
        auth: AuthenticationService
    }

): FeathersService<A, FileService> {

    const { app, auth, path, pagination, fs, s3 } = setingsAndRefs 

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
                path.replace(`/`, ``)
            ) 
        }),

        {
            koa: {
                before: [
                    errorHandler(),
                    serve({ verify, path, fs, s3, method: `get` }),
                    uploadPart({ verify, path, fs, s3, method: `update`}),
                    uploadComplete({ verify, path, fs, s3, method: `create`})
                ],
                after: [
                    // deleteFileAfterRemoval({ method: 'remove' })
                ]
            },
            methods: [`create`, `find`, `get`, `patch`, `remove`],
            events: [],
        }

    )

    const files = app.service(path) as unknown as FeathersService<A, FileService>
    files.hooks({
        around: {
            all: [
                ...auth ? [authenticate(`jwt`)] : [],
                resolveAll(fileResolveAll)
            ]
        }
    })

    app.log`file service configured`

    return files

}

/*** Exports ***/

export default setupFileService

export {
    FileService,
    FileParams 
}

export * from './middleware'
export * from './schema'
export * from './service'
export * from './resolvers'

export {
    MAX_UPLOAD_PART_SIZE,
    PART_DIR_NAME,
    SERVER_RENDERER_ID
} from './constants'
