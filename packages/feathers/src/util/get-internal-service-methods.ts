import { InternalServiceMethods } from '@feathersjs/adapter-commons'
import { Service, ServiceGenericType } from '@feathersjs/feathers'

import { StringKeys } from '../types'

//// Types ////

type InternalServiceMethodKeys = StringKeys<InternalServiceMethods>[]

//// Main ////

function getInternalServiceMethods<
    S extends Service,
    M extends InternalServiceMethodKeys =
    ['$find', '$get', '$create', '$update', '$patch', '$remove']
>(
    service: S,
    methods: M = ['$find', '$get', '$create', '$update', '$patch', '$remove'] as M
): Pick<InternalServiceMethods<ServiceGenericType<S>>, M[number]> {

    if (methods.length === 0) {
        throw new Error(
            'No methods provided.'
        )
    }

    for (const method of methods) {
        if (!(method in (service as Service)))
            throw new Error(`Service does not have internal method "${method}"`)
    }

    return service as unknown as InternalServiceMethods<ServiceGenericType<S>>
}

//// Exports ////

export default getInternalServiceMethods

export { getInternalServiceMethods }