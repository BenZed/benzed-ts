import { isObject, isString, isTruthy } from '@benzed/is'
import match from '@benzed/match'
import { Empty } from '@benzed/util'

import { HttpMethod } from '../../../modules'

import { CommandHook, RuntimeCommand } from '../../../command'
import { Database, Paginated, Record } from '../database'

//// Types ////

type ToDatabaseOutput<I extends object, O extends object> = 
    Promise<
    I extends { query: object } 
        ? Paginated<Record<O>>
        : Record<O> | null
    >

type ToDatabase<I extends object, O extends object> = CommandHook<O, ToDatabaseOutput<I,O>>

//// Hook ////

const toDatabase = <I extends object, O extends object>(method: HttpMethod, collectionName?: string): ToDatabase<I,O> => 
    function (this: RuntimeCommand<I>, input: O) {

        collectionName = (collectionName ?? '') || this.pathFromRoot.split('/').filter(isTruthy).join('-')

        const database = this.getModule(Database, true, 'parents')
        const collection = database.getCollection<O>(collectionName)

        const resultMatch = match(method)
            .case(HttpMethod.Post, () => collection.create(input))
            .case(HttpMethod.Put, () => collection.update(...splitIdFromData(input)))
            .case(HttpMethod.Patch, () => collection.update(...splitIdFromData(input)))
            .case(HttpMethod.Delete, () => collection.remove(splitIdFromData(input)[0]))
            .case(HttpMethod.Get, () => {
                const idOrQuery = splitIdQueryFromData(input)

                return isString(idOrQuery)
                    ? collection.get(idOrQuery)
                    : collection.find(idOrQuery as Empty) // TODO support queries
            })
            .default(() => Promise.resolve(null))
            // .next() as ToDatabaseOutput<I, O>

        const [ result ] = resultMatch

        return result as ToDatabaseOutput<I,O>
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