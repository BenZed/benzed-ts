
import { 
    setupMongoDBService, 
    MongoDBAdapterParams,
    MongoDBApplication
} from '@benzed/feathers'

import { 
    FeathersService,
    Service
} from '@feathersjs/feathers'

import { AuthenticationService } from '../authentication'
import { RenderService } from '../render'

import * as fileHooks from './hooks'

import { 
    File,
    FileData,
    FileQuery,
    FileServiceConfig
} from './schema'

/*** Types ***/

type FileParams = MongoDBAdapterParams<FileQuery> & { user?: { _id: string } }

type FileService = Service<File, Partial<FileData>, FileParams>

type FileServiceRefs<A extends MongoDBApplication> = {
    app: A
    auth?: FeathersService<A, AuthenticationService>
    render?: FeathersService<A, RenderService>
    path: string
}

/*** Main ***/

// A configure function that registers the service and its hooks via `app.configure`
function addFileService<A extends MongoDBApplication>(
    
    refs: FileServiceRefs<A>,
    config: FileServiceConfig

): FeathersService<A, FileService> {

    const { app, auth, render, path } = refs
    const { pagination } = config 

    const fileService = setupMongoDBService<File, Partial<FileData>, FileParams>(
        app,

        // mongo service options
        { 
            path: path,
            collection: path,
            paginate: pagination
        },

        // feathers service options
        {
            methods: ['create', 'find', 'get', 'patch', 'remove'],

            // You can add additional custom events to be sent to clients here
            events: []
        }
    )

    fileService.hooks(fileHooks)

    app.log`file service configured`

    return app.service(path)
}

/*** Exports ***/

export default addFileService

export {
    FileService,
    FileServiceRefs,
    FileParams 
}

export * from './hooks'
export * from './middleware'
export * from './schema'
