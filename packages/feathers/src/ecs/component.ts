import { Component } from '@benzed/ecs'

import { 
    FeathersBuildContext, 
    BuildEffect,
    BuildLifecycleMethod 
} from './types'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Build Components ***/

type FeathersComponents = readonly FeathersComponent<any, any>[]

type RequiredComponentTypes<C extends FeathersComponents> = C extends [] 
    ? readonly never []
    : {
        [K in keyof C]: new (...args: any) => C[K]
    }

/*** Requirements ***/

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

/**
 * Base class for components that construct feathers applications
 */
abstract class FeathersComponent<
    B extends BuildEffect = BuildEffect,
    R extends FeathersComponentRequirements<any,any> | undefined = undefined
> extends Component<FeathersBuildContext> {

    static requirements<C extends FeathersComponents, S extends boolean>(
        single: S,
        ...types: RequiredComponentTypes<C>
    ): FeathersComponentRequirements<C,S> {
        return new FeathersComponentRequirements(single, ...types) as any
    }
    
    abstract readonly requirements: R

    /**
     * Creates an object that affects the app 
     */
    protected abstract _createBuildEffect(): B

    /**
     * Called after the app is first configured.
     */
    protected _onConfigure?: BuildLifecycleMethod

    /**
     * Merge existing build context
     */
    compute(ctx: FeathersBuildContext): FeathersBuildContext {
        
        const {
            config, 
            services, 
            extends: _extends 
        } = this._createBuildEffect()

        const onConfigure = this._onConfigure 
            ? [this._onConfigure] 
            : []

        return {
            ...ctx,
            onConfigure: [
                ...ctx.onConfigure,
                ...onConfigure
            ],
            config: {
                ...ctx.config,
                ...config
            },
            services: {
                ...ctx.services,
                ...services
            },
            extends: {
                ...ctx.extends,
                ..._extends
            }
        }
    }
}

/*** Exports ***/

export default FeathersComponent

export {
    FeathersComponent,
    FeathersComponents,
    FeathersComponentRequirements
}