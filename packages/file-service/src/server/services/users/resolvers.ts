import { resolve } from '@benzed/feathers'
import { passwordHash } from '@feathersjs/authentication-local'

import {

    UserData,
    UserPatchData,
    User,
    UserQuery,

    $userData,
    $userPatchData,
    $user,
    $usersQuery

} from './schema'

import { FileServerHookContext } from '../../create-file-server-app'
import { UserService } from './index'

// this is only here to shut ts up about it

type UserServiceHookContext = FileServerHookContext<UserService>

// Resolver for the basic data model (e.g. creating new entries)
export const userDataResolver = resolve<UserData, UserServiceHookContext>({
    schema: $userData,
    validate: 'before',
    properties: {
        password: passwordHash({ strategy: 'local' })
    }
})

// Resolver for making partial updates
export const userPatchResolver = resolve<UserPatchData, UserServiceHookContext>({
    schema: $userPatchData,
    validate: 'before',
    properties: {
        password: passwordHash({ strategy: 'local' })
    }
})

// Resolver for the data that is being returned
export const userResolver = resolve<User, UserServiceHookContext>({
    schema: $user,
    validate: false,
    properties: {

    }
})

// Resolver for the "safe" version that external clients are allowed to see
export const userDispatchResolver = resolve<User, UserServiceHookContext>({
    schema: $user,
    validate: false,
    properties: {
        // The password should never be visible externally
        password: () => Promise.resolve(undefined)
    }
})

// Resolver for allowed query properties
export const userQueryResolver = resolve<UserQuery, UserServiceHookContext>({
    schema: $usersQuery,
    validate: 'before',
    properties: {
        // If there is a user (e.g. with authentication), 
        // they are only allowed to see their own data
        _id: (value, _user, context) => {
            if (context.params.user)
                return Promise.resolve(context.params.user._id)

            return Promise.resolve(value)
        }
    }
})

// Export all resolvers in a format that can be used with the resolveAll hook
const usersResolvers = {
    result: userResolver,
    dispatch: userDispatchResolver,
    data: {
        create: userDataResolver,
        update: userDataResolver,
        patch: userPatchResolver
    },
    query: userQueryResolver
}

export default usersResolvers