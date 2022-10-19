import { Paginated, Service, Query } from '@feathersjs/feathers'

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

type RecordOf<S extends Service> = S extends Service<infer R, any, any> ? R : any

/*** For Each Record ***/

/**
 * Iterate through each record of a given query on the client or server
 */
async function forEachRecord<S extends Service>(
    service: S,
    query: Query,
    func: (
        record: RecordOf<S>, 
        result: Paginated<RecordOf<S>>, 
        service: S
    ) => void | Promise<void> | boolean | Promise<boolean>
): Promise<void> {

    let total = Infinity
    let skip = query.$skip ?? 0
    while (skip < total) {

        // Get Records
        const result: Paginated<RecordOf<S>> = await service.find({
            query: {
                ...query,
                $skip: skip,
            }
        })

        // Set Total
        if (!isFinite(total))
            total = result.total

        // Exec Record
        for (const record of result.data) {
            const shouldBreak = await func(record, result, service)
            if (shouldBreak)
                return
        }

        skip += result.data.length
    }

}

/*** Exports ***/

export default forEachRecord

export {
    forEachRecord
}