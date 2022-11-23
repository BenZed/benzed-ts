
import { AroundHookFunction, Service, Paginated } from '@feathersjs/feathers'
import { toPaginated } from '../util'

//// Helper ////

/**
 * Utility function that ensures a service has at least one record outside the context of a hook.
 * @param service 
 */
const createRecordIfNoneExists = async <R>(
    defaultRecordData: Partial<R>,
    service: Service<R>
): Promise<void> => {

    const result = await service.find({}) as R[] | Paginated<R>
    const { total } = toPaginated(result)
    if (total === 0)
        await service.create(defaultRecordData)
}

//// Main ////

/**
 * Ensures a services has at least one record.
 */
function ensureAtLeastOneRecord<R>(
    defaultRecordData: Partial<R>
): AroundHookFunction {

    return async function ({ service, method }, next) {

        if (method !== 'remove') {
            throw new Error(
                'ensureAtLeastOneRecord hook should only be called by the \'remove\' method'
            )
        }

        await next()
        await createRecordIfNoneExists(defaultRecordData, service)
    }
}

//// Exports ////

export default ensureAtLeastOneRecord

export {
    ensureAtLeastOneRecord,
    createRecordIfNoneExists
}
