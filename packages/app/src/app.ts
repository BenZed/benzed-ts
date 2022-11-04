import { Flatten } from 'mongodb'
import { Module, Modules } from './module'

import { ServiceModule, Service, FlattenModules, ToService } from './service'

import { Path } from './types'

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
    ): App<FlattenModules<[...M, Mx]>> {
        return new App(
            this._pushModule(module)
        ) as App<FlattenModules<[...M, Mx]>>
    }

    override useModules<Mx extends Modules>(
        ...modules: Mx
    ): App<FlattenModules<[...M, ...Mx]>> {
        return new App(
            this._pushModule(...modules)
        ) as App<FlattenModules<[...M, ...Mx]>>
    }

}

//// Export ////

export default App 

export {
    App
}