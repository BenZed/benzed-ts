import { setupMongoDBService, MongoDBAdapterParams } from '@benzed/feathers'

import { Service } from '@feathersjs/feathers'

import { UserData, UserQuery, User } from './schema'
import * as userHooks from './hooks'

import { FileServerApp } from '../../create-file-server-app'

/*** Types ***/

export type UsersParams = MongoDBAdapterParams<UserQuery> & { user?: User }

export type UserService = Service<User, UserData, UsersParams>

/*** Setup ***/

// A configure function that registers the service and its hooks via `app.configure`
export default function setupUserService(app: FileServerApp): void {

    const paginate = app.get('pagination')

    const userService = setupMongoDBService<User, UserData, UsersParams>(
        app,

        // mongo service options
        {
            collection: 'users',
            paginate
        },

        // feathers service options
        {
            methods: ['find', 'get', 'create', 'update', 'patch', 'remove'],
            // You can add additional custom 
            // events to be sent to clients here
            events: [],
        }

    )

    userService.hooks(userHooks)
}

/*** Exports ***/

export * from './schema'
export * from './hooks'
export * from './resolvers'