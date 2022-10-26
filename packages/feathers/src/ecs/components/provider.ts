
import { Server } from "http"
import { FeathersComponents, FeathersExtendComponent } from "../component"

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
    C extends FeathersComponents
> extends FeathersExtendComponent<P, C> {

}

abstract class RestComponent<
    P extends ProviderExtend,
    C extends FeathersComponents
> extends ProviderComponent<P, C> {
 
}

abstract class RealtimeComponent<
    P extends ProviderExtend,
    C extends FeathersComponents
> extends ProviderComponent<P, C> {

}

/*** Exports ***/

export default ProviderComponent

export {
    ProviderComponent,
    RestComponent,
    RealtimeComponent,

    ProviderExtend
}