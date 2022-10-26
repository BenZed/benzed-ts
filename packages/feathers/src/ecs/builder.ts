
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
    ): unknown

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

}

/*** Exports ***/

export default FeathersBuilder

export {
    FeathersBuilder
}