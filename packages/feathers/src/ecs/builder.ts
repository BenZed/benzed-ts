
import { FeathersModules, FeathersModule, FeathersModuleConstructor } from './module'

import { FeathersBuildContext } from './types'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** Types ***/

type FeathersModuleInitMethod<M extends FeathersModules, Mx extends FeathersModule> =
    (components: M) => Mx

/*** Builder ***/

/**
 * ECS Node for creating feathers applications
 */
abstract class FeathersBuilder<M extends FeathersModules> extends FeathersModule<M> {

    abstract use<Mx extends FeathersModule>(
        constructorOrInitMethod: FeathersModuleConstructor<Mx> | FeathersModuleInitMethod<M, Mx>
    ): FeathersBuilder<[...M, Mx]> 
    
    // {

    //     return new FeathersBuilder([
    //         ...this.components, 
    //         this._initializeModule(constructorOrInitMethod)
    //     ])
    // }

    protected _initializeModule<Mx extends FeathersModule>(
        constructorOrInitMethod: FeathersModuleConstructor<Mx> | FeathersModuleInitMethod<M, Mx>
    ): Mx {

        let mod: Mx 
        try {
            mod = (constructorOrInitMethod as FeathersModuleInitMethod<M, Mx>)(this.components)
        } catch {
            mod = new (constructorOrInitMethod as FeathersModuleConstructor<Mx>)(this.components)
        }

        if (!(mod instanceof FeathersModule))
            throw new Error(`Must be an instance of ${FeathersModule}`)

        return mod
    }

    override compute(ctx: FeathersBuildContext): FeathersBuildContext {

        ctx = super.compute(ctx)

        for (const component of this.components) 
            ctx = component.compute(ctx)

        return ctx
    }

    abstract build(input: unknown): unknown

    // build(config: FeathersBuilderInput<M> = getDefaultConfiguration()): FeathersBuilderOutput<M> {

    //     this._assertAtLeastOneComponent()

    //     const ctx = this.compute({
    //         config: {},
    //         extends: {},
    //         services: {},

    //         onCreate: [],
    //         onConfig: []
    //     })
        
    //     const app = this._createApplication(config, ctx)

    //     this._registerServices(app, ctx.services)
    //     this._applyExtensions(app, ctx.extends)

    //     return app as FeathersBuilderOutput<M>
    // }

}

/*** Exports ***/

export default FeathersBuilder

export {
    FeathersBuilder
}