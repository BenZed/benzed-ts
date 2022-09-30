import { MethodNotAllowed } from '@feathersjs/errors'
import { AroundHookFunction } from '@feathersjs/feathers'

/*** Types ***/

type Provider = 'server' | 'rest' | 'socketio' | 'primus' | 'external'

/*** Main ***/

/**
 * Disallow providers from using a given service method.
 * @param providers Providers to disallow.
 */
function disallow(
    ...providers: Provider[]
): AroundHookFunction {

    return async function ({ params, method }, next) {

        const provider = params.provider as Provider | undefined

        const allProvidersDisallowed = providers.length === 0
        const thisProviderDisallowed = allProvidersDisallowed ||
            providers.some(p =>
                p === provider ||
                p === 'server' && !provider ||
                p === 'external' && !!provider
            )

        if (thisProviderDisallowed) {
            throw new MethodNotAllowed(
                `Provider '${provider ?? 'server'}' can not call '${method}'.`
            )
        }

        await next()
    }
}

/*** Exports ***/

export default disallow

/**
 * Disallow service method from being used by any provider.
 */
export const disallowAll = disallow()

/**
 * Disallow client providers from being used.
 */
export const disallowClient = disallow('external')

export {
    disallow
}
