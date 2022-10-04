import { $id, $querySyntax } from '@benzed/feathers'
import { $, Infer } from '@benzed/schema'

/*** Helper ***/

/**
 * Password in the database, hashed.
 */
const $hashedPassword = $.string()

/**
 * Password from the user, unhashed
 */
const $password = $.string().length('>=', 8)

/*** Schemas ***/

export type UserData = Infer<typeof $userData> 
export const $userData = $({
    email: $.string().format('email'),
    password: $hashedPassword,
    created: $.date(),
    updated: $.date()
})

export type User = Infer<typeof $user>
export const $user = $({
    _id: $id,
    ...$userData.$
})

export type UseCreateData = Infer<typeof $userPatchData>
export const $userCreateData = $({
    email: $user.$.email,
    password: $password
})

export type UserPatchData = Infer<typeof $userPatchData>
export const $userPatchData = $({
    email: $user.$.email.optional(),
    password: $password
})

// Schema for allowed query properties
export type UserQuery = Infer<typeof $userQuery>
export const $userQuery = $querySyntax({
    _id: $user.$._id,
    email: $user.$.email.optional(),
    updated: $user.$.updated.optional(),
    created: $user.$.created.optional()
})

