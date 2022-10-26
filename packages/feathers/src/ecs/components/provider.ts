
import { Server } from "http"
import { 
    FeathersComponentRequirements, 
    FeathersExtendComponent
} from "../component"

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** Types ***/

interface ProviderExtend {
    server?: Server
    listen(...args: any[]): Server | Promise<Server>
}

/*** Main ***/

/**
 * Component that installs REST functionality into a feathers app.
 * Defined here mostly so it can be used as a requirement for other apps
 */
abstract class ProviderComponent<
    P extends ProviderExtend,
    T extends 'realtime' | 'rest',
    R extends FeathersComponentRequirements<any,any> | undefined = undefined
> extends FeathersExtendComponent<P, R> {

    constructor(
        public type: T
    ) {
        super()
    }

}

abstract class RestComponent<
    P extends ProviderExtend,
    R extends FeathersComponentRequirements<any, true> = FeathersComponentRequirements<[], true>
> extends ProviderComponent<P, 'rest', R> {

    requirements = FeathersExtendComponent.requirements(true) as R

    constructor() {
        super(`rest`)
    }

}

abstract class RealtimeComponent<
    P extends ProviderExtend,
    R extends FeathersComponentRequirements<any, true> = FeathersComponentRequirements<[], true>
> extends ProviderComponent<P, 'realtime', R> {

    requirements = FeathersExtendComponent.requirements(true) as R

    constructor() {
        super(`realtime`)
    }

}

/*** Exports ***/

export default ProviderComponent
export {
    ProviderComponent,
    RestComponent,
    RealtimeComponent,

    ProviderExtend
}