
import { setupMongoDBService } from '@benzed/feathers'
import { MongoDBAdapterParams } from '@feathersjs/mongodb'

import { FileServerApp } from '../../create-file-server-app'

import * as userHooks from './hooks'

import { FileData, FileQuery, File } from './schema'

export type FilesParams = MongoDBAdapterParams<FileQuery>

// A configure function that registers the service and its hooks via `app.configure`
export default function setupUserService(app: FileServerApp): void {

    const fileService = setupMongoDBService<File, FileData, FilesParams>(
        app,

        // mongo service options
        {
            collection: 'files',
        },

        // feathers service options
        {
            methods: ['create', 'find', 'get', 'patch', 'remove'],
            // You can add additional custom events to be sent to clients here
            events: []
        }
    )

    fileService.hooks(userHooks)
}

/*** Exports ***/

export * from './schema'
export * from './service'
export * from './hooks'
export * from './middleware'