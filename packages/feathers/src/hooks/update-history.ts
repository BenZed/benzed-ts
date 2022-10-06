
import { BadRequest } from '@feathersjs/errors'
import {
    AroundHookFunction,
    FeathersService,
    HookContext,
    Params,
    Service
} from '@feathersjs/feathers'

import {
    Historical,
    HistoryEntry,
    HistoryScribe,
    HistoryScribeOptions,
    HistoryInvalidError
} from '@benzed/history-scribe'

import $, { Infer, SchemaFor } from '@benzed/schema'
import is from '@benzed/is'

import { getInternalServiceMethods } from '../util'

/*** Types ***/

type HookData = HookContext['data']

interface UpdateHistoryOptions<H> extends HistoryScribeOptions<H> {

    /**
     * Optional method that allows the hook to pluck only history related fields 
     * from context.data
     */
    dataMask?: (data: H) => H

}

const $historyQueryParam = (({ or, string, shape, tuple, number }) => {
    /*
        // New syntax
        shape({ 
            splice: optional.tuple(string.or.number, number),
            revert: optional.string.or.number
        })
    */

    const stringOrNumber = or(string, number)
    const splice = tuple(stringOrNumber, number).optional
    const revert = stringOrNumber.optional

    return shape({ splice, revert }).default({})
})($)

interface HistoryQueryParam extends Infer<typeof $historyQueryParam> {}

/*** Constants ***/

const HISTORY_QUERY_PARAM = '$history'

/*** Helper ***/

async function getExistingHistory<T>(
    ctx: HookContext<unknown, Service<Historical<T>>>
): Promise<Historical<T>['history']> {

    if (ctx.id === undefined)
        throw new Error('Cannot retrieve existing history, id missing.')

    const record = await getInternalServiceMethods(ctx.service).$get(ctx.id) as Historical<T>
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

// TODO move me
function consumeQueryParam<T>(
    query: Params['query'],
    name: string,
    $schema: SchemaFor<T>
): T {
    if (query && name in query) {
        const historyParam = query[name]
        delete query[name]
        return $schema.validate(historyParam)
    }
    return $schema.validate(undefined)
}

function consumeHistoryQueryParam(
    query: Params['query'],
): HistoryQueryParam {
    return consumeQueryParam(query, HISTORY_QUERY_PARAM, $historyQueryParam)
}

async function applyScribeData<T extends object>(
    scribe: HistoryScribe<T>,
    ctx: HookContext<unknown, Service<Historical<T>>>
): Promise<void> {

    const scribeData = scribe.compile()

    if (ctx.data) {
        for (const key in scribeData)
            (ctx.data as HookData)[key] = (scribeData as HookData)[key]
    } else if (ctx.service && ctx.id)
        await getInternalServiceMethods(ctx.service).$patch(ctx.id, scribeData)
    else
        throw new BadRequest('Invalid history input.')
}

function createEntry<T extends object>(
    ctx: HookContext<unknown, Service<Historical<T>>>,
    dataMask?: (data: HookData) => T
): HistoryEntry<T> {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signature = (ctx.params as any)
        ?.user
        ?.[(ctx.service as FeathersService).id as string]
        .toString() ?? null

    const timestamp = Date.now()
    const method = ctx.method as 'patch' | 'remove' | 'create'

    const entry: HistoryEntry<T> = method === 'remove'
        ? { method, signature, timestamp }
        : { method, signature, timestamp, data: getEntryData(ctx.data, dataMask) }

    return entry
}

/*** Main ***/

/**
 * Updates the history of the of the given record.
 * @param providers Providers to disallow.
 */
function updateHistory<T extends object>(
    hookOptions?: UpdateHistoryOptions<T>
):
    AroundHookFunction<unknown, Service<Historical<T>>> {

    const {
        dataMask,
        ...scribeOptions
    } = hookOptions ?? {}

    return async function (ctx, next) {

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
                    : await getExistingHistory(ctx)
            })

            // Prevent history errors from being thrown when they should probably 
            // be bad requests.
            if (scribe.history.some(e => e.method === 'remove'))
                scribe = scribe.revert(-1)

            const entry = createEntry(ctx, dataMask)
            scribe = scribe.push(entry)

            const { revert, splice } = consumeHistoryQueryParam(ctx.params.query)
            if (is.defined(splice))
                scribe = scribe.splice(...splice)
            if (is.defined(revert))
                scribe = scribe.revert(revert)

            await applyScribeData(scribe, ctx)

        } catch (e) {
            if (e instanceof HistoryInvalidError)
                throw new BadRequest(e.message)
            else
                throw e
        }

        await next()
    }
}

/*** Exports ***/

export default updateHistory

export {

    updateHistory,
    UpdateHistoryOptions,

    $historyQueryParam,
    HistoryQueryParam,
}
