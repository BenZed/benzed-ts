import { schema, querySyntax } from '@feathersjs/schema'
import type { Infer } from '@feathersjs/schema'

/* eslint-disable
    @typescript-eslint/no-empty-interface
*/

// Schema for the basic data model (e.g. creating new entries)
export const userSchema = schema({
    $id: 'User',
    type: 'object',
    additionalProperties: false,

    required: ['email', 'password'],
    properties: {

        email: {
            type: 'string'
        },

        password: {
            type: 'string'
        },

        created: {
            type: 'number'
        },

        updated: {
            type: 'number'
        }

    }
} as const)

const { properties: USER_PROPERTIES } = userSchema

export interface UserData extends Infer<typeof userSchema> {
    /**/
}

// Schema for making partial updates
export const userPatchDataSchema = schema({
    $id: 'UserPatchData',
    type: 'object',
    additionalProperties: false,
    required: [],
    properties: {
        email: USER_PROPERTIES.email
    }
} as const)

export type UserPatchData = Infer<typeof userPatchDataSchema>

// Schema for the data that is being returned
export const usersResultSchema = schema({
    $id: 'UsersResult',
    type: 'object',
    additionalProperties: false,
    required: ['_id'],
    properties: {
        ...USER_PROPERTIES,
        _id: {
            type: 'string'
        }
    }
} as const)

export type UsersResult = Infer<typeof usersResultSchema>

// Schema for allowed query properties
export const usersQuerySchema = schema({
    $id: 'UsersQuery',
    type: 'object',
    additionalProperties: false,
    properties: querySyntax({
        email: USER_PROPERTIES.email,
        updated: USER_PROPERTIES.updated,
        created: USER_PROPERTIES.created,
    })
} as const)

export type UserQuery = Infer<typeof usersQuerySchema>
