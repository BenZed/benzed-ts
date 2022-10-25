import { Component } from '@benzed/ecs'
import { BuildContext, BuildEffect, BuildLifecycleMethod } from './types'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Build Components ***/

type BuildComponents = readonly BuildComponent<BuildEffect>[]

type RequiredComponentTypes<C extends BuildComponents> = C extends [] 
    ? readonly never []
    : {
        [K in keyof C]: new (...args: any) => C[K]
    }

/*** Requirements ***/

/**
 * Requirements build component need to adhere to before being 
 * added onto a stack
 */
class Requirements<C extends BuildComponents = [], S extends boolean = false> {

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
abstract class BuildComponent<
    B extends BuildEffect = BuildEffect,
> extends Component<BuildContext> {
    
    abstract readonly requirements?: Requirements<any,any>

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
    compute(ctx: BuildContext): BuildContext {
        
        const {
            config, 
            services, 
            extend 
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
            extend: {
                ...ctx.extend,
                ...extend
            }
        }
    }
}

/*** Exports ***/

export default BuildComponent

export {
    BuildComponent,
    BuildComponents,
    Requirements
}