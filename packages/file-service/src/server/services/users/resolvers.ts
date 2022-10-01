import { resolve } from '@feathersjs/schema'
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

import { 
    FileServerHookContext 
} from '../../create-file-server-app'

// this is only here to shut ts up about it
import 'json-schema-to-ts/lib/utils'

// Resolver for the basic data model (e.g. creating new entries)
export const usersDataResolver = resolve<UserData, FileServerHookContext>({
    schema: $userData,
    validate: 'before',
    properties: {
        password: passwordHash({ strategy: 'local' })
    }
})

// Resolver for making partial updates
export const usersPatchResolver = resolve<UserPatchData, FileServerHookContext>({
    schema: $userPatchData,
    validate: 'before',
    properties: {
        password: passwordHash({ strategy: 'local' })
    }
})

// Resolver for the data that is being returned
export const usersResultResolver = resolve<User, FileServerHookContext>({
    schema: $user,
    validate: false,
    properties: {

    }
})

// Resolver for the "safe" version that external clients are allowed to see
export const usersDispatchResolver = resolve<User, FileServerHookContext>({
    schema: $user,
    validate: false,
    properties: {
        // The password should never be visible externally
        password: () => Promise.resolve(undefined)
    }
})

// Resolver for allowed query properties
export const usersQueryResolver = resolve<UserQuery, FileServerHookContext>({
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
    result: usersResultResolver,
    dispatch: usersDispatchResolver,
    data: {
        create: usersDataResolver,
        update: usersDataResolver,
        patch: usersPatchResolver
    },
    query: usersQueryResolver
}

export default usersResolvers