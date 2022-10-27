
import ProviderComponent from './app-modules/provider'
import { 
    FeathersBuilder,
    FeathersModules, 
    FeathersModule, 
    FeathersModuleConstructor, 
    FeathersModuleInitMethod, 
    FeathersBuildModule

} from './module'

import { BuildEffect } from './types'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/explicit-function-return-type
*/

/*** Temp ***/

class FeathersServiceBuilderModule<P extends string> extends FeathersBuildModule {

    readonly path!: P

    protected override _validateComponents(): void {
        this._assertRequired(ProviderComponent)
    }

    protected _createBuildEffect!: () => BuildEffect<any>

}

/*** Builder ***/

/**
 * ECS Node for creating feathers applications
 */
class FeathersServiceBuilder<M extends FeathersModules> extends FeathersBuilder<M> {

    static create(): FeathersServiceBuilder<[]> {
        return new FeathersServiceBuilder([])
    }

    private constructor(
        modules: M
    ) {
        super(modules)
    }

    override use<Cx extends FeathersModule>(
        constructorOrInitMethod: 
        FeathersModuleConstructor<Cx> | 
        FeathersModuleInitMethod<M, Cx>
    
    ): FeathersServiceBuilder<[...M, Cx]> {

        return new FeathersServiceBuilder([
            ...this.components, 
            this._initializeModule(constructorOrInitMethod)
        ])
    }

    build(input: unknown): unknown {
        return input
    }

    asBuildModule<P extends string>(path: P): new (modules: FeathersModules) => FeathersServiceBuilderModule<P> {
        return class extends FeathersServiceBuilderModule<P> {
            override readonly path: P = path
            protected override _createBuildEffect = () => ({})
        }

    }

    // Helper 

}

/*** Exports ***/

export default FeathersServiceBuilder

export {
    FeathersServiceBuilder
}