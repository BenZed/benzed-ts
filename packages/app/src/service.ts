import { StateOf, Structural } from '@benzed/immutable'
import { each, GenericObject, NamesOf } from '@benzed/util'
import Module from './module'

//// Types ////

/**
 * In a service, any string key that contains a module
 * is considered state.
 */
type ServiceState<T extends Service> = {
    [K in NamesOf<T> as T[K] extends Module ? K : never]: T[K] extends Module 
        ? StateOf<T[K]>
        : never
}

//// Main ////

/**
 * A service
 */
class Service extends Module {

    get [Structural.state](): ServiceState<this> {
        const state: GenericObject = {}
        for (const [key, value] of each.entryOf(this)) {
            if (Module.is(value))
                state[key] = value
        }

        return state as ServiceState<this>
    }

}

//// Exports ////

export default Service

export {
    Service
}