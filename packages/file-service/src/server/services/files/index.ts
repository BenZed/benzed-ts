
import { 
    MongoDBApplication
} from '@benzed/feathers'

import { 
    Service,
    FeathersService
} from '@feathersjs/feathers'

import { AuthenticationService } from '../authentication'

import * as fileHooks from './hooks'

import { File, FileData, FileServiceConfig } from './schema'

import { FileService, FileParams } from './service'

/*** Types ***/

interface FileServiceRefs<A extends MongoDBApplication> {
    app: A
    auth: FeathersService<A, AuthenticationService>
    path: string
}

/*** Main ***/

function setupFileService<A extends MongoDBApplication>(
    
    refs: FileServiceRefs<A>,
    config: FileServiceConfig

): FeathersService<A, Service<File, Partial<FileData>, FileParams>> {

    const { app, auth, path } = refs
    const { pagination, fs, s3 } = config 

    const fileService = app.use(

        path, 
        
        new FileService({

            auth,

            paginate: pagination,
            multi: false,

            Model: app.db(path)

        }),
        
        {
            methods: ['create', 'find', 'get', 'patch', 'remove'],
            events: []
        }
    )

    fileService.hooks(fileHooks)

    app.log`file service configured`

    return app.service(path)
}

/*** Exports ***/

export default setupFileService

export {
    FileService,
    FileServiceRefs,
    FileParams 
}

export * from './hooks'
export * from './middleware'
export * from './schema'
