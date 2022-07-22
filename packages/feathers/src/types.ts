import type { StringKeys } from '@benzed/util'

import type {
    Application,
    HookContext,
    HookFunction,
    NextFunction,
    Paginated
} from '@feathersjs/feathers'

import type { ObjectId } from 'mongodb'

/*** Exports ***/

export type ServerId = ObjectId

export type ClientId = string

export type Record<I, D> = I extends void ? D : D & { _id: I }

export {

    Application,
    HookContext,
    HookFunction,
    NextFunction,
    Paginated,

    StringKeys
}
