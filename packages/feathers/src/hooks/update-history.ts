import is from '@benzed/is'

import { BadRequest } from '@feathersjs/errors'
import {
    AroundHookFunction,
    HookContext,
    Params,
    Service
} from '@feathersjs/feathers'

import { schema, Infer, getSchemaDefinition } from '../schemas'

import {

    ObjectId,
    IdType
} from '../types'

import { getInternalServiceMethods } from '../util'

import {
    Historical,
    HistoryEntry,
    HistoryScribe,
    HistoryScribeOptions,
    HistoryInvalidError
} from '@benzed/history-scribe'

/*** Types ***/

type HookData = HookContext['data']

interface UpdateHistoryOptions<H> extends HistoryScribeOptions<H> {

    /**
     * Optional method that allows the hook to pluck only history related fields 
     * from context.data
     */
    dataMask?: (data: H) => H

}

const HistoryQueryParamSchema = schema({
    $id: 'HistoryQueryParam',
    type: 'object',
    additionalProperties: false,

    properties: {
        splice: {
            type: 'array',
            minItems: 2,
            maxItems: 2,
            items: [{
                type: ['string', 'number'],
            }, {
                type: 'number'
            }]
        },
        revert: {
            type: ['string', 'number']
        },
    }

} as const)

type HistoryQueryParam = Infer<typeof HistoryQueryParamSchema>

/*** Constants ***/

const HISTORY_QUERY_PARAM = '$history'

/*** Helper ***/

async function getExistingHistory<T>(
    service: Service<Historical<T>>,
    id?: IdType
): Promise<Historical<T>['history']> {

    if (id === undefined)
        throw new Error('Cannot retrieve existing history, id missing.')

    const record = await getInternalServiceMethods(service).$get(id.toString()) as Historical<T>
    return record.history
}

function getEntryData<T extends object>(input: HookData, mask?: (d: unknown) => T): T {

    if (is.array(input)) {
        throw new BadRequest(
            'Multi record requests are invalid.'
        )
    }

    const output = applyMask(input, mask)

    if ('history' in output)
        delete output.history

    return output
}

function applyMask<T>(input: T, mask?: ((data: unknown) => T)): T {

    if (!mask)
        return { ...input }

    const output = mask(input)
    for (const key in output) {
        if (key in input === false)
            //                   ^ in case the mask added an undefined field
            delete output[key]
    }

    return output
}

function consumeHistoryQueryParam(
    query: Params['query'],
): HistoryQueryParam {

    if (query && HISTORY_QUERY_PARAM in query) {
        const historyParam = query[HISTORY_QUERY_PARAM]
        delete query[HISTORY_QUERY_PARAM]
        return historyParam
    }

    return {}
}

async function applyScribeData<T extends object>(
    scribe: HistoryScribe<T>,
    ctxData?: HookData,
    service?: Service<Historical<T>>,
    id?: ObjectId
): Promise<void> {

    const scribeData = scribe.compile()

    if (ctxData) {
        for (const key in scribeData)
            ctxData[key] = (scribeData as HookData)[key]
    } else if (service && id)
        await getInternalServiceMethods(service).$patch(id.toString(), scribeData)
    else
        throw new BadRequest('Invalid history input.')
}

function createEntry<T extends object>(

    params: Params,
    method: HistoryEntry<T>['method'],

    data: HookData,
    dataMask?: (data: HookData) => T

): HistoryEntry<T> {

    const { user } = params as { user: { _id: IdType } }

    const signature = user?._id.toString() ?? null
    const timestamp = Date.now()

    const entry: HistoryEntry<T> = method === 'remove'
        ? { method, signature, timestamp }
        : { method, data: getEntryData(data, dataMask), signature, timestamp }

    return entry
}

/*** Main ***/

/**
 * Updates the history of the of the given record.
 * @param providers Providers to disallow.
 */
function updateHistory<T extends object>(
    hookOptions?: UpdateHistoryOptions<T>
): AroundHookFunction<unknown, Service<Historical<T>>> {

    const {
        dataMask,
        ...scribeOptions
    } = hookOptions ?? {}

    return async function (ctx, next) {

        const { service, id, params, data } = ctx

        const serverId = id as unknown as ObjectId

        // Validate Call
        const method = ctx.method as 'create' | 'update' | 'patch' | 'remove' | 'find' | 'get'
        if (method === 'find' || method === 'get' || method === 'update')
            throw new Error(`Cannot use updateHistory hook with '${method}' method`)

        try {

            // Compute Next History
            let scribe = new HistoryScribe<T>({
                ...scribeOptions,
                history: method === 'create'
                    ? []
                    : await getExistingHistory(service, serverId)
            })

            // Prevent history errors from being thrown when they should probably 
            // be bad requests.
            if (scribe.history.some(e => e.method === 'remove'))
                scribe = scribe.revert(-1)

            const entry = createEntry(params, method, data, dataMask)
            scribe = scribe.push(entry)

            const { revert, splice } = consumeHistoryQueryParam(params.query)
            if (is.defined(splice))
                scribe = scribe.splice(...splice as Parameters<typeof scribe.splice>)
            if (is.defined(revert))
                scribe = scribe.revert(revert)

            await applyScribeData(scribe, data, service, serverId)

        } catch (e) {
            if (e instanceof HistoryInvalidError)
                throw new BadRequest(e.message)
            else
                throw e
        }

        await next()
    }
}

const historyQueryParam = (): Omit<typeof HistoryQueryParamSchema.definition, '$id'> =>
    getSchemaDefinition(HistoryQueryParamSchema)

/*** Exports ***/

export default updateHistory

export {

    updateHistory,
    UpdateHistoryOptions,

    HistoryQueryParamSchema,
    HistoryQueryParam,
    historyQueryParam

}
