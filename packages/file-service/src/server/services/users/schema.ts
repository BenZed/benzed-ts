import { $id, $querySyntax } from '@benzed/feathers'
import { $, Infer } from '@benzed/schema'

/*** Helper Schemas ***/

/**
 * Password in the database, hashed.
 */
const $hashedPassword = $.string

/**
 * Password from the user, unhashed
 */
const $password = $.string.length('>=', 8)

/*** User Schemas ***/

export interface UserData extends Infer<typeof $userData> {}
export const $userData = $({
    name: $.string.optional,
    email: $.string.format('email'),
    password: $hashedPassword,
    created: $.date,
    updated: $.date
})

export interface User extends Infer<typeof $user> {}
export const $user = $({
    _id: $id,
    ...$userData.$
})

export interface UserCreateData extends Infer<typeof $userPatchData> {}
export const $userCreateData = $({
    email: $user.$.email,
    password: $password
})

export interface UserPatchData extends Infer<typeof $userPatchData> {}
export const $userPatchData = $({
    email: $user.$.email.optional,
    password: $password.optional
})

// Schema for allowed query properties
export interface UserQuery extends Infer<typeof $userQuery> {}
export const $userQuery = $querySyntax({
    _id: $user.$._id,
    email: $user.$.email.optional,
    updated: $user.$.updated.optional,
    created: $user.$.created.optional
})

