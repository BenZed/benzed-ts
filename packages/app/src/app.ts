import { Module, Modules } from './module'

import { ServiceModule, FlattenModules, ToService } from './service'

import { Path } from './util/types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// App ////

/**
 * An app is essentially just a Service without a path. 
 * The root 
 */
class App<M extends Modules = Modules> extends ServiceModule<M> {

    // Sealed Construction 

    static create(): App<[]> {
        return new App([])
    }

    private constructor(modules: M) {
        super(modules)
    }
  
    // Use Interface

    override useService<Px extends Path, S extends ServiceModule<any>>(
        path: Px,
        module: S
    ): App<[...M, ToService<Px ,S>]> {
        return new App(
            this._pushModule(path, module)
        ) as App<[...M, ToService<Px ,S>]>
    }

    override useModule<Mx extends Module>(
        module: Mx
    ): App<[...M, ...FlattenModules<[Mx]>]> {
        return new App(
            this._pushModule(module)
        ) as App<[...M, ...FlattenModules<[Mx]>]>
    }

    override useModules<Mx extends Modules>(
        ...modules: Mx
    ): App<[...M, ...FlattenModules<Mx>]> {
        return new App(
            this._pushModule(...modules)
        ) as App<[...M, ...FlattenModules<Mx>]>
    }

}

//// Export ////

export default App 

export {
    App
}