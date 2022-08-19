import { InternalServiceMethods } from '@feathersjs/adapter-commons'
import { ServiceGenericType } from '@feathersjs/feathers'

import { Service, StringKeys } from '../types'

/*** Types ***/

type InternalServiceMethodKeys = StringKeys<InternalServiceMethods>[]

/*** Main ***/

function getInternalServiceMethods<
    S extends Service,
    M extends InternalServiceMethodKeys =
    ['_find', '_get', '_create', '_update', '_patch', '_remove']
>(
    service: S,
    methods: M = ['_find', '_get', '_create', '_update', '_patch', '_remove'] as M
): Pick<InternalServiceMethods<ServiceGenericType<S>>, M[number]> {

    if (methods.length === 0) {
        throw new Error(
            'No methods provided.'
        )
    }

    for (const method of methods) {
        if (!(method in service))
            throw new Error(`Service does not have internal method "${method}"`)
    }

    return service as unknown as InternalServiceMethods<ServiceGenericType<S>>
}

/*** Exports ***/

export default getInternalServiceMethods

export { getInternalServiceMethods }