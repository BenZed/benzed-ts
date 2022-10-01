import { $querySyntax } from '@benzed/feathers/lib'
import { $, Infer } from '@benzed/schema'

/* eslint-disable
    @typescript-eslint/no-empty-interface
*/

/*** Schemas ***/

export type UserData = Infer<typeof $userData> 
export const $userData = $({
    email: $.string().format('email'),
    password: $.string(),
    created: $.date(),
    updated:  $.date()
})

export type User = Infer<typeof $user>
export const $user = $({
    _id: $.string(),
    ...$userData.$
})

// Schema for making partial updates

export type UserPatchData = Infer<typeof $userPatchData>
export const $userPatchData = $({
    email: $user.$.email.optional()
})

export type UseCreateData = Infer<typeof $userPatchData>
export const $userCreateData = $({
    email: $user.$.email,
    password: $user.$.password
})

// Schema for allowed query properties
export const $usersQuery = $querySyntax({
    email: $user.$.email.optional(),
    updated: $user.$.updated.optional(),
    created: $user.$.created.optional()
})

export type UserQuery = Infer<typeof $usersQuery>
