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

    private constructor(
        modules: M
    ) {
        super(modules)
    }
  
    // Use Interface

    override use<Px extends Path, S extends Service<any>>(
        path: Px,
        module: S
    ): App<[...M, S extends CommandModule<infer Mx> ? Service<Px, Mx> : never]>

    override use<Mx extends Module>(
        module: Mx
    ): App<[...M, Mx]>

    override use<Mx extends Module>(
        ...args: Mx extends CommandModule<any>
            ? [path: string, module: Mx] | [module: Mx] 
            : [module: Mx]
    ): App<[...M, Mx]> {
        return new App(
            this._pushModule(...args)
        )
    }

}

/*** Export ***/

export default App 

export {
    App
}