
import { Server } from "http"
import { FeathersExtendComponent } from "../module"

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
> extends FeathersExtendComponent<P> {

}

abstract class RestComponent<
    P extends ProviderExtend,
> extends ProviderComponent<P> {
 
}

abstract class RealtimeComponent<
    P extends ProviderExtend,
> extends ProviderComponent<P> {

}

/*** Exports ***/

export default ProviderComponent

export {
    ProviderComponent,
    RestComponent,
    RealtimeComponent,

    ProviderExtend
}