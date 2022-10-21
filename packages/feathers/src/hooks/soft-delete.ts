
import { BadRequest, NotFound } from '@feathersjs/errors'

import { getInternalServiceMethods } from '../util'
import {
    ServiceGenericData,
    ServiceGenericType,
    Params,
    Service,
    AroundHookFunction
} from '@feathersjs/feathers'

/*** Types ***/

interface SoftDeleteOptions {
    deleteField?: string
    deleteQueryParam?: string
}

/*** Helper ***/

function consumeDeleteQueryParam(
    query: Params['query'],
    deleteQueryParam: string
): boolean | 'restore' {

    let deleteParam: 'restore' | boolean = false

    if (query && deleteQueryParam in query) {
        deleteParam = query[deleteQueryParam] ?? false
        delete query[deleteQueryParam]
    }

    return deleteParam
}

interface SoftDeleteQueryProperty {
    enum: ['restore', true, false]
}

function softDeleteQueryParam(): SoftDeleteQueryProperty {
    return {
        enum: [`restore`, true, false]
    }
}

/*** Main ***/

/**
 * Disallow providers from using a given service method.
 * @param providers Providers to disallow.
 */
function softDelete<
    S extends Service = Service
>(options?: SoftDeleteOptions): AroundHookFunction<unknown, S> {

    const {
        deleteField = `deleted`,
        deleteQueryParam = `$deleted`
    } = options ?? {}

    return async function (context, next) {

        const { service, method, id, params, data } = context

        // Parse $delete query param
        const deleteParam = consumeDeleteQueryParam(params.query, deleteQueryParam)
        const includeDeleted = deleteParam === true
        const restoreDeleted = deleteParam === `restore`
        if (restoreDeleted && method !== `patch`) {
            throw new BadRequest(
                `Invalid ${deleteQueryParam} param value: ` +
                `'restore' can only be used with the 'patch' method.`
            )
        }
        if (includeDeleted && method === `create`) {
            throw new BadRequest(
                `${deleteQueryParam} param cannot be used with the 'create' method.`
            )
        }

        // Ignore create method
        if (method === `create`)
            return next()

        // Handle found records
        if (method === `find` && !includeDeleted) {
            context.params.query = {
                ...params.query,
                [deleteField]: {
                    $in: [undefined, null]
                }
            }
        }
        if (method === `find`)
            return next()

        if (id === undefined)
            throw new Error(`id is required using the "${method}" with the soft-delete hook`)

        const _service = getInternalServiceMethods(service)

        const record = await _service.$get(id)
        if (record[deleteField] && !includeDeleted && !restoreDeleted)
            throw new NotFound(`No record found for id '${id}'`)
        else if (!record[deleteField] && restoreDeleted)
            throw new NotFound(`No removed record found for id '${id}'`)

        // prevent a second unneccessary call to the database
        if (method === `get`)
            context.result = record

        else if (
            method === `remove` && !includeDeleted ||
            method === `patch` && restoreDeleted
        ) {
            context.result = await _service.$patch(
                id,
                {
                    ...data,
                    [deleteField]: restoreDeleted ? null : new Date()
                } as ServiceGenericData<S>
            ) as ServiceGenericType<S>
        }

        await next()
    }
}

/*** Exports ***/

export default softDelete

export {
    softDelete,
    softDeleteQueryParam
}
