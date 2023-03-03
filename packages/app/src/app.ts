import { Module } from './module'
import Service from './service'
import { OnStart, OnStop } from './traits'
import OnValidate from './traits/on-validate'

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

}

//// Exports ////

export default App

export {
    App
}
