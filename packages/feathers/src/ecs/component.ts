import { Component } from '@benzed/ecs'

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

type RequiredComponentTypes<C extends FeathersComponents> = C extends [] 
    ? readonly never []
    : {
        [K in keyof C]: new (...args: any) => C[K]
    }

/**
 * Requirements build component need to adhere to before being 
 * added onto a stack
 */
class FeathersComponentRequirements<C extends FeathersComponents = FeathersComponents, S extends boolean = false> {

    readonly types: RequiredComponentTypes<C>
    
    components!: C

    constructor(
        readonly single: S = false as S,
        ...types: RequiredComponentTypes<C>
    ) {
        this.types = types
    }
}

/*** Components ***/

type FeathersComponents = readonly FeathersComponent<any>[]

/**
 * Component that makes mutations to the app
 */
abstract class FeathersComponent<R extends FeathersComponentRequirements<any,any> | undefined = undefined >
    extends Component<FeathersBuildContext> {

    static requirements<C extends FeathersComponents, S extends boolean>(
        single: S,
        ...types: RequiredComponentTypes<C>
    ): FeathersComponentRequirements<C,S> {
        return new FeathersComponentRequirements(single, ...types) as any
    }

    abstract readonly requirements: R

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
abstract class FeathersBuildComponent<
    B extends BuildEffect = BuildEffect,
    R extends FeathersComponentRequirements<any,any> | undefined = undefined
> extends FeathersComponent<R> {

    /**
     * A feathers build component can run lifecycle nmethods, but
     * also has effects that change the type of the app.
     */
    protected abstract _createBuildEffect(): B

    compute(ctx: FeathersBuildContext): FeathersBuildContext {
        
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
    E extends Exclude<BuildEffect['extends'], undefined>,
    R extends FeathersComponentRequirements<any,any> | undefined = undefined
> extends FeathersBuildComponent<{ extends: E }, R> {

    protected abstract _createBuildExtends(): E

    protected _createBuildEffect(): { extends: E } {
        return {
            extends: this._createBuildExtends()
        }
    }

}

abstract class FeathersConfigComponent<
    C extends Exclude<BuildEffect['config'], undefined>,
    R extends FeathersComponentRequirements<any,any> | undefined = undefined
> extends FeathersBuildComponent<{ config: C }, R> {

    protected abstract _createBuildConfig(): C

    protected _createBuildEffect(): { config: C } {
        return {
            config: this._createBuildConfig()
        } 
    }

}

abstract class FeathersServiceComponent<
    S extends Exclude<BuildEffect['services'], undefined>,
    R extends FeathersComponentRequirements<any,any> | undefined = undefined
> extends FeathersBuildComponent<{ services: S }, R> {

    protected abstract _createBuildServices(): S

    protected _createBuildEffect(): { services: S } {
        return {
            services: this._createBuildServices()
        } 
    }

}

/*** Exports ***/

export default FeathersBuildComponent

export {
    FeathersComponent,
    FeathersComponents,

    FeathersComponentRequirements,

    FeathersBuildComponent,

    FeathersExtendComponent,
    FeathersConfigComponent,
    FeathersServiceComponent
}