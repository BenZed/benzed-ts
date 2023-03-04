import { copy } from '@benzed/immutable'
import { assign } from '@benzed/util'
import { Module } from './module'
import { Client, ClientSettings } from './modules'
import { Service } from './service'
import { OnStart, OnStop, OnValidate } from './traits'

//// Helper Types ////

type _AppWithKeys<A extends App> =
    Exclude<keyof A, 'asClient' | 'asServer'>

//// Types ////

type AsClient<A extends App> = 
    { [K in _AppWithKeys<A>]: A[K]} &
    { readonly client: Client }

// type AppWithServer<A extends App> = 
//     { [K in _AppWithKeys<A>]: A[K] } & 
//     { readonly server: Server }

//// Main ////

/**
 * The App class is a type of Module that serves as the root of the module tree. It is responsible
 * for coordinating the start and stop sequence of all its child modules.
 */
abstract class App extends Module.add(Service, OnValidate) {

    /**
     * Apps should always be the root, and cannot be nested in
     * other apps.
     */
    onValidate(): void {
        this._assertRoot()
    }

    private _running = false 
    get running() {
        return this._running
    }

    /**
     * Validate all modules and then start the app.
     */
    async start(): Promise<void> {

        if (this._running)
            throw new Error(`${this.name} is already running`)
        this._running = true

        const allModules = this.find.all.inDescendents()

        // validate each module that implements the OnValidate trait
        for (const module of allModules) {
            if (OnValidate.is(module))
                module.onValidate()
        }

        // start each module that implements the OnStart trait
        for (const module of allModules) {
            if (OnStart.is(module))
                await module.onStart()
        }

    }

    /**
     * Stop the app.
     */
    async stop(): Promise<void> {

        if (!this._running)
            throw new Error(`${this.name} is not running`)
        this._running = false

        for (const module of this.find.all.inDescendents()) {
            if (OnStop.is(module))
                await module.onStop()
        }

    }

    asClient(settings?: Partial<ClientSettings>): AsClient<this> {

        const clone = copy(this)
        const client = new Client(settings)

        return assign(clone, { client }) as AsClient<this>
    }

    // asServer(settings?: Partial<ServerSettings>): AsServer<this> {}

}

//// Exports ////

export default App

export {
    App
}
