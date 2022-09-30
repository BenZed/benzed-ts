import { $, Infer } from '@benzed/schema'

/* eslint-disable
    @typescript-eslint/no-empty-interface
*/

/*** User Properties ***/

const $id = $.string()
const $email = $.string().format('email')
const $password = $.string()
const $created = $.date()
const $updated = $.date()

/*** Schemas ***/

export const $userSchema = $({
    email: $email,
    password: $password,
    created: $created,
    updated: $updated
})
export type UserData = Infer<typeof $userSchema> 

// Schema for making partial updates
export const userPatchDataSchema = $({
    email: $email.optional()
})

export type UserPatchData = Infer<typeof userPatchDataSchema>

// Schema for the data that is being returned
export const usersResultSchema = $({
    _id: $id,
    email: $email,
    password: $password,
    created: $created,
    updated: $updated
})

export type UserResult = Infer<typeof usersResultSchema>

// Schema for allowed query properties
export const usersQuerySchema = $querySyntax({
    email: $email,
    updated: $updated,
    created: $created
})

export type UserQuery = Infer<typeof usersQuerySchema>
