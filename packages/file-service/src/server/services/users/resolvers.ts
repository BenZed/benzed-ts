import { resolve } from '@benzed/feathers'
import { passwordHash } from '@feathersjs/authentication-local'

import {

    UserPatchData,
    User,
    UserQuery,

    $user,
    $userPatchData,
    $userQuery,
    UseCreateData,
    $userCreateData,

} from './schema'

import { FileServerHookContext } from '../../create-file-server-app'
import { UserService } from './index'

/*
    eslint-disable require-await
*/

type UserServiceHookContext = FileServerHookContext<UserService>

// Resolver for the basic data model (e.g. creating new entries)
export const userCreateResolver = resolve<UseCreateData, UserServiceHookContext>({
    schema: $userCreateData,
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
        _id: async id => id?.toString()
    }
})

// Resolver for the "safe" version that external clients are allowed to see
export const userDispatchResolver = resolve<User, UserServiceHookContext>({
    schema: $user,
    validate: false,
    properties: {
        ...userResolver.options.properties,
        // The password should never be visible externally
        password: async () => ''

    }
})

// Resolver for allowed query properties
export const userQueryResolver = resolve<UserQuery, UserServiceHookContext>({
    schema: $userQuery,
    validate: 'before',
    properties: {

        // If there is a user (e.g. with authentication), 
        // they are only allowed to see their own data
        _id: async (value, _user, context) => context.params.user?._id ?? value

    }
})

// Export all resolvers in a format that can be used with the resolveAll hook
const usersResolvers = {
    result: userResolver,
    dispatch: userDispatchResolver,
    data: {
        create: userCreateResolver,
        update: userCreateResolver,
        patch: userPatchResolver
    },
    query: userQueryResolver
}

export default usersResolvers