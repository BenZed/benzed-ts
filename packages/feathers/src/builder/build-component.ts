import { Component } from '@benzed/ecs'
import { SchemaFor } from '@benzed/schema'
import { Empty, Merge } from '@benzed/util'

import { Application, Service } from '@feathersjs/feathers'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** App ***/

type App<S extends Services = any, C extends Config = any> = Application<S,C>

type Config = { [key: string]: unknown }
type ConfigOf<A extends App> = A extends App<any, infer C> ? C : Empty

type Services = { [key: string]: Service }
type ServicesOf<A extends App> = A extends App<infer S, any> ? S : Empty

type Extends = { [key: string]: (this: App, ...args: any) => any }

/*** Build Effect ***/

interface BuildEffect {

    readonly config?: { [key: string]: SchemaFor<unknown> }

    readonly services?: { [key: string]: (app: App) => Service }

    readonly extend?: Extends
}

type ToBuildEffect<C extends { config?: Config, services?: Services, extends?: Extends }> = {

    [K in keyof BuildEffect as K extends keyof C ? K : never]:

    K extends 'config' 
        ? { [Kx in keyof C['config']]: SchemaFor<C['config'][Kx]> }

        : K extends 'services'
            ? { [Kx in keyof C['services']]: (app: App) => C['services'][Kx] }

            : C['extends']
}

type MergeBuildEffects<C extends BuildComponents> = Merge<{
    [K in keyof C]: C[K] extends BuildComponent<infer B>  
        ? Required<B>
        : Empty
}>

type FromBuildEffect<C extends BuildComponents> = {
    [K in keyof BuildEffect]-?: K extends keyof MergeBuildEffects<C> 
        
        ? {
            [Kx in keyof MergeBuildEffects<C>[K]]: 

            // Configuration 
            K extends 'config'
                ? MergeBuildEffects<C>[K][Kx] extends { validate: (input: unknown) => infer R } 
                    ? R 
                    : unknown 
                
            // Services
                : K extends 'services' 
                    ? MergeBuildEffects<C>[K][Kx] extends (...args: any) => infer S 
                        ? S extends Service 
                            ? S 
                            : never
                        : never

                // Extensions
                    : MergeBuildEffects<C>[K][Kx]
        }
        
        : Empty
}

/*** Build Context ***/

type BuildLifecycleMethod = (app: App) => void

interface BuildContext extends Required<BuildEffect> {
    readonly required: BuildComponents
    readonly onConfigure: readonly BuildLifecycleMethod[]
    // readonly onDatabase: readonly AppInitializer[]
    // readonly onRegister: readonly AppInitializer[]
}

/*** Build Components ***/

type BuildComponents = readonly BuildComponent<any, any>[]

type RequiredComponentTypes = readonly (
    new (...args: unknown[]) => BuildComponent<any, any>
)[]

type RequiredComponents<R extends RequiredComponentTypes> = {
    [K in keyof R]: InstanceType<R[K]>
}

/**
 * Base class for components that construct feathers applications
 */
abstract class BuildComponent<
    B extends BuildEffect,
    R extends RequiredComponentTypes = [],
    S extends boolean = false
> extends Component<BuildContext> {

    /**
     * Other build components that are required
     */
    abstract readonly required: R extends [] ? never[] : R

    /**
     * If true, this component may only used in a builder once
     */
    abstract readonly single: S
         
    /**
     * Creates an object that affects the app 
     */
    protected abstract _createBuildEffect(required: RequiredComponents<R>): B

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
        } = this._createBuildEffect(ctx.required as RequiredComponents<R>)

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

    App, 

    Config,
    ConfigOf,

    Services,
    ServicesOf,

    Extends,

    BuildContext,
    BuildEffect,
    ToBuildEffect,
    FromBuildEffect
}