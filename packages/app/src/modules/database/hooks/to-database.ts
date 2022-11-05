import { isObject, isString, isTruthy } from '@benzed/is'
import { Empty } from '@benzed/util'
import match from '@benzed/match'

import { HttpMethod } from '../../../modules'

import { CommandHook, RuntimeCommand } from '../../../command'
import { Database, Paginated, Record } from '../database'

//// Types ////

type ToDatabaseOutput<I extends object, O extends object> = 
    Promise<
    I extends { query: object } 
        ? Paginated<Record<O>>
        : Record<O>
    >

type ToDatabase<I extends object, O extends object> = CommandHook<O, ToDatabaseOutput<I,O>>

//// Hook ////

const toDatabase = <I extends object, O extends object>(method: HttpMethod, collectionName?: string): ToDatabase<I,O> => 
    function (this: RuntimeCommand<I>, input: O) {

        collectionName = (collectionName ?? '') || this.pathFromRoot.split('/').filter(isTruthy).join('-')

        const database = this.getModule(Database, true, 'parents')
        const collection = database.getCollection<O>(collectionName)

        return match(method)
            .break(HttpMethod.Post, () => collection.create(input))
            .break(HttpMethod.Put, () => collection.update(...splitIdFromData(input)))
            .break(HttpMethod.Patch, () => collection.update(...splitIdFromData(input)))
            .break(HttpMethod.Delete, () => collection.remove(splitIdFromData(input)[0]))
            .break(HttpMethod.Get, () => {
                const idOrQuery = splitIdQueryFromData(input)

                return isString(idOrQuery)
                    ? collection.get(idOrQuery)
                    : collection.find(idOrQuery as Empty) // TODO support queries
            })
            .next() as ToDatabaseOutput<I, O>
    }

//// Helpers ////

function splitIdQueryFromData(input: object): string | object {
    const { _id, query } = input as { _id?: string, query?: object }

    if (isString(_id))
        return _id

    if (isObject(query))
        return query

    throw new Error('No \'_id\' or \'query\' property in input')
}

function splitIdFromData(input: object): [string, object] {

    const { _id, ...rest } = input as { _id?: string }
    if (!isString(_id))
        throw new Error('No \'_id\' property in input')

    return [ _id, rest ]
}

//// Exports ////

export default toDatabase

export {
    toDatabase,
    ToDatabase,
    ToDatabaseOutput,
}