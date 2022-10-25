import { Component } from '@benzed/ecs'

import { 
    BuildEffect,
    BuildLifecycleMethod,
    FeathersBuildContext, 

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
     * Called after the app is first configured.
     */
    protected _onConfigure?: BuildLifecycleMethod

    compute(ctx: FeathersBuildContext): FeathersBuildContext {
     
        const onConfigure = this._onConfigure 
            ? [this._onConfigure] 
            : []

        return {
            ...ctx,
            onConfigure: [
                ...ctx.onConfigure,
                ...onConfigure
            ]
        }
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

/*** Exports ***/

export default FeathersBuildComponent

export {
    FeathersBuildComponent,
    FeathersComponents,
    FeathersComponent,
    FeathersComponentRequirements
}