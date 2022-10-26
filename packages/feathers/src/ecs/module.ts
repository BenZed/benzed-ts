import { Node } from '@benzed/ecs'

import { 
    BuildEffect,
    LifeCycleMethod,
    FeathersBuildContext,
    CreateLifeCycleMethod, 

} from './types'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Requirements ***/

export type FeathersModuleConstructor<C extends FeathersModule = FeathersModule> = 
    (new (components: FeathersModules) => C)

/*** Components ***/

type FeathersModules = readonly FeathersModule[]

/**
 * Component that makes mutations to the app
 */
abstract class FeathersModule<C extends FeathersModules = FeathersModules> extends Node<FeathersBuildContext, FeathersBuildContext, C> {

    // Build Api

    /**
     * Called when the app is created. 
     * Mutations made to the app object on create can be
     * returned to affect the actual app.
     */
    protected _onCreate?: CreateLifeCycleMethod

    /**
     * Called after the app is first configured.
     */
    protected _onConfig?: LifeCycleMethod

    compute(ctx: FeathersBuildContext): FeathersBuildContext {
     
        for (const lifeCycleName of [`onCreate`, `onConfig`] as const) {

            const lifeCyleMethod = this[`_${lifeCycleName}`]
                ? [this[`_${lifeCycleName}`]] 
                : []
            
            ctx = {
                ...ctx,
                [lifeCycleName]: [
                    ...ctx[lifeCycleName],
                    ...lifeCyleMethod
                ]
            }
        }

        return ctx
    }

}

/**
 * Base class for components that construct feathers applications
 */
abstract class FeathersBuildModule<B extends BuildEffect = BuildEffect> extends FeathersModule {

    /**
     * A feathers build component can run lifecycle nmethods, but
     * also has effects that change the type of the app.
     */
    protected abstract _createBuildEffect(): B

    override compute(ctx: FeathersBuildContext): FeathersBuildContext {
        
        const effect = this._createBuildEffect()

        return super.compute({
            ...ctx,
            config: {
                ...ctx.config,
                ...effect.config
            },
            services: {
                ...ctx.services,
                ...effect.services
            },
            extends: {
                ...ctx.extends,
                ...effect.extends
            }
        })
    }
}

abstract class FeathersExtendComponent<
    E extends Exclude<BuildEffect['extends'], undefined>
> extends FeathersBuildModule<{ extends: E }> {

    protected abstract _createBuildExtends(): E

    protected _createBuildEffect(): { extends: E } {
        return {
            extends: this._createBuildExtends()
        }
    }

}

abstract class FeathersConfigComponent<
    S extends Exclude<BuildEffect['config'], undefined>,
> extends FeathersBuildModule<{ config: S }> {

    protected abstract _createBuildConfig(): S

    protected _createBuildEffect(): { config: S } {
        return {
            config: this._createBuildConfig()
        } 
    }

}

abstract class FeathersServiceComponent<
    S extends Exclude<BuildEffect['services'], undefined>
> extends FeathersBuildModule<{ services: S }> {

    protected abstract _createBuildServices(): S

    protected _createBuildEffect(): { services: S } {
        return {
            services: this._createBuildServices()
        } 
    }

}

/*** Exports ***/

export default FeathersBuildModule

export {
    FeathersModule,
    FeathersModules,

    FeathersBuildModule,

    FeathersExtendComponent,
    FeathersConfigComponent,
    FeathersServiceComponent
}