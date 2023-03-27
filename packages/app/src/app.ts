import { define } from '@benzed/util'

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
    Exclude<keyof A, 'asClient' | 'asServer' | 'client' | 'server'>

//// Types ////

type AsClient<A extends App> =
    { [K in _AppWithKeys<A>]: A[K] } &
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

    override get name(): string {
        const suffix = this.server ? 'Server' : this.client ? 'Client' : ''
        return this.constructor.name + suffix
    }

    //// Trait Methods ////

    protected async _onStart(): Promise<void> {
        const allModules = this.find.all.inDescendants()

        // validate each module that implements the Validateable trait
        for (const module of allModules) {
            if (Validateable.is(module))
                module.validate()
        }

        // start each module that implements the Runnable trait
        for (const module of allModules) {
            if (Runnable.is(module))
                await module.start()
        }

    } 

    protected async _onStop(): Promise<void> {

        const allModules = this.find.all.inDescendants()
        for (const module of allModules) {
            if (Runnable.is(module))
                await module.stop()
        } 
    }

    protected _onValidate(): void {
        this._assertRoot()
    }

    //// Builder Methods ////

    asClient(settings?: Partial<ClientSettings>): AsClient<this> {

        const clone = this[Module.copy]()
        const client = new Client(settings)

        return define.enumerable(clone, 'client', client) as AsClient<this>
    }

    asServer(settings?: Partial<ServerSettings>): AsServer<this> {
        const clone = this[Module.copy]()
        const server = new Server(settings)

        return define.enumerable(clone, 'server', server) as AsServer<this>
    }

}

//// Exports ////

export default App

export {
    App,
    AsClient,
    AsServer
}
