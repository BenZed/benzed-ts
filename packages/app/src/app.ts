
import { ServiceModule, FlattenModules, _ToService } from './service'
import { AppModule, AppModuleArray } from './app-module'
import { Path } from './util/types'

//// Eslint /////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// App ////

/**
 * An app is essentially just a Service without a path.
 */
class App<M extends AppModuleArray = AppModuleArray> extends ServiceModule<M> {

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
    ): App<[...M, _ToService<Px ,S>]> {
        return new App(
            this._pushModule(path, module)
        ) as App<[...M, _ToService<Px ,S>]>
    }

    override useModule<Mx extends AppModule>(
        module: Mx
    ): App<[...M, ...FlattenModules<[Mx]>]> {
        return new App(
            this._pushModule(module)
        ) as App<[...M, ...FlattenModules<[Mx]>]>
    }

    override useModules<Mx extends AppModuleArray>(
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