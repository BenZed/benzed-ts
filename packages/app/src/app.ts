import { copy } from '@benzed/immutable'
import { assign } from '@benzed/util'

import { Module } from './module'

import {

    Server,
    ServerSettings,
    Client,
    ClientSettings

} from './modules'

import { Service } from './service'

import { Runnable, Validateable } from './traits'

//// Helper Types ////

type _AppWithKeys<A extends App> =
    Exclude<keyof A, 'asClient' | 'asServer'>

//// Types ////

type AsClient<A extends App> = 
    { [K in _AppWithKeys<A>]: A[K]} &
    { readonly client: Client }

type AsServer<A extends App> = 
    { [K in _AppWithKeys<A>]: A[K] } & 
    { readonly server: Server }

//// Main ////

/**
 * The App class is a type of Module that serves as the root of the module tree. It is responsible
 * for coordinating the start and stop sequence of all its child modules.
 */
abstract class App extends Module.add(Service, Runnable, Validateable) {

    //// Trait Methods ////

    protected async _onStart(): Promise<void> {
        const allModules = this.find.all.inDescendents()

        // validate each module that implements the OnValidate trait
        for (const module of allModules) {
            if (Validateable.is(module))
                module.validate()
        }

        // start each module that implements the OnStart trait
        for (const module of allModules) {
            if (Runnable.is(module))
                await module.start()
        }

    }

    protected async _onStop(): Promise<void> {
        for (const module of this.find.all.inDescendents()) {
            if (Runnable.is(module))
                await module.stop()
        }
    }

    protected _onValidate(): void {
        this._assertRoot()
    }

    //// Builder Methods ////

    asClient(settings?: Partial<ClientSettings>): AsClient<this> {

        const clone = copy(this)
        const client = new Client(settings)

        return assign(clone, { client }) as AsClient<this>
    }

    asServer(settings?: Partial<ServerSettings>): AsServer<this> {
        const clone = copy(this)
        const server = new Server(settings)

        return assign(clone, { server }) as AsServer<this>
    }

}

//// Exports ////

export default App

export {
    App
}
