
import { setupMongoDBService } from '@benzed/feathers'
import { MongoDBAdapterParams } from '@feathersjs/mongodb'

import { FileServerApp } from '../../create-file-server-app'

import * as userHooks from './hooks'

import { UsersData, UsersQuery, UsersResult } from './schema'

export type UsersParams = MongoDBAdapterParams<UsersQuery>

// A configure function that registers the service and its hooks via `app.configure`
export default function setupUserService(app: FileServerApp): void {

    const userService = setupMongoDBService<UsersResult, UsersData, UsersParams>(app, {
        collection: 'users',
    }, {
        // A list of all methods this service exposes externally
        methods: ['find', 'get', 'create', 'update', 'patch', 'remove'],
        // You can add additional custom events to be sent to clients here
        events: []
    })

    userService.hooks(userHooks)
}

