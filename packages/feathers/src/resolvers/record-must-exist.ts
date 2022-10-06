
import { Application } from '@feathersjs/feathers'
import { BadRequest } from '@feathersjs/errors'

import { StringKeys } from '../types'

/*** Types ***/

type ServicesOf<A extends Application> = A extends Application<infer S> ? S : unknown

/**
 * Throws if the provided id
 */
export const recordMustExist = <
    A extends Application,
    N extends StringKeys<ServicesOf<A>>
>(
    serviceName: N
) => async (
    id: string | null | undefined,
    _record: unknown,
    context: { app: A }
) => {

    const { app } = context

    if (id) {
        await app
            .service(serviceName)
            .get(id ?? '')
    } else 
        throw new BadRequest(`id for ${serviceName} service required`)

    return id
}
