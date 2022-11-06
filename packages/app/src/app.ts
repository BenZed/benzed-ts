import { Module, Modules } from './module'

import { CommandModule, Service } from './service'

import { Path } from './types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// App ////

/**
 * An app is essentially just a Service without a path. 
 * The root 
 */
class App<M extends Modules = Modules> extends CommandModule<M> {

    // Sealed Construction 

    static create(): App<[]> {
        return new App([])
    }

    private constructor(modules: M) {
        super(modules)
    }
  
    // Use Interface

    override useModule<Px extends Path, S extends CommandModule<any>>(
        path: Px,
        module: S
    ): App<[...M, S extends CommandModule<infer Mx> ? Service<Px, Mx> : Module]>

    override useModule<Mx extends Module>(
        module: Mx
    ): App<[...M, Mx]>

    override useModule(
        ...args: [path: Path, module: Module] | [module: Module] 
    ): App<Modules> {
        return new App(
            this._pushModule(...args)
        )
    }

}

//// Export ////

export default App 

export {
    App
}