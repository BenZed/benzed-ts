import type { StringKeys } from '@benzed/util'

import type {
    Application,
    HookContext,
    HookFunction,
    NextFunction,
    Paginated,
    Params
} from '@feathersjs/feathers'

import type { ObjectId } from 'mongodb'

/*** Exports ***/

export type IdType = string | number | ObjectId

export interface Id<I extends IdType> {
    _id: I
}

export interface Service<
    I extends IdType,
    CreateRecordData,
    UpdateRecordData = Partial<CreateRecordData>,
    Record extends { _id: I } = CreateRecordData & Id<I>,
    P = Params> {

    find(params?: P): Promise<Paginated<Record>>

    get(id: I, params?: P): Promise<Record>

    create(data: CreateRecordData, params?: P): Promise<Record>

    // update(id: I, data: CreateRecordData, params?: P): Promise<Record>

    patch(id: I, data: UpdateRecordData, params?: P): Promise<Record>

    remove(id: I, params?: P): Promise<Record>

    setup?(app: Application, path: string): Promise<void>

    teardown?(app: Application, path: string): Promise<void>
}

export {

    Application,
    HookContext,
    HookFunction,
    NextFunction,
    Paginated,
    Params,
    ObjectId,

    StringKeys
}
