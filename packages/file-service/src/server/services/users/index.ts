import { setupMongoDBService, MongoDBAdapterParams } from '@benzed/feathers'

import { Service } from '@feathersjs/feathers'

import { UserData, UserQuery, User } from './schema'
import * as userHooks from './hooks'

import { FileServerApp } from '../../create-file-server-app'

/*** Types ***/

type UserParams = MongoDBAdapterParams<UserQuery> & { user?: User }
type UserService = Service<User, Partial<UserData>, UserParams>

/*** Setup ***/

// A configure function that registers the service and its hooks via `app.configure`
function setupUserService(app: FileServerApp): void {

    const paginate = app.get('pagination')

    const userService = setupMongoDBService<User, Partial<UserData>, UserParams>(
        app,

        // MongoDB Service Options
        {
            collection: 'users',
            paginate
        },

        // Feathers Service Options
        {

            methods: ['find', 'get', 'create', 'patch', 'remove'],

            // You can add additional custom 
            // events to be sent to clients here
            events: []

        }

    )

    userService.hooks(userHooks)
}

/*** Exports ***/

export default setupUserService

export {
    UserService,
    UserParams 
}
export * from './hooks'
export * from './resolvers'
export * from './schema'
