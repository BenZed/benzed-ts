
import { MongoDBService, setupMongoDBService } from '@benzed/feathers'
import { MongoDBAdapterParams } from '@feathersjs/mongodb'

import * as userHooks from './hooks'
import { UserData, UserQuery, UserResult } from './schema'

import { FileServerApp } from '../../create-file-server-app'

export type UsersParams = MongoDBAdapterParams<UserQuery>

export type UserService = MongoDBService<UserResult, UserData, UsersParams>

// A configure function that registers the service and its hooks via `app.configure`
export default function setupUserService(app: FileServerApp): void {

    const userService = setupMongoDBService<UserResult, UserData, UsersParams>(
        app,

        // mongo service options
        {
            collection: 'users',
        },

        // feathers service options
        {
            methods: ['find', 'get', 'create', 'update', 'patch', 'remove'],
            // You can add additional custom events to be sent to clients here
            events: []
        }
    )

    userService.hooks(userHooks)
}

export * from './schema'
export * from './hooks'
export * from './resolvers'