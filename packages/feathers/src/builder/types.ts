
import BuildComponent, { BuildComponents } from "./build-component"

import { SchemaFor } from '@benzed/schema'
import { Empty, Merge } from '@benzed/util'

import { Application, Service } from '@feathersjs/feathers'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** App ***/

export type App<S extends Services = any, C extends Config = any> = Application<S,C>

export type Config = { [key: string]: unknown }
export type ConfigOf<A extends App> = A extends App<any, infer C> ? C : Empty

export type Services = { [key: string]: Service }
export type ServicesOf<A extends App> = A extends App<infer S, any> ? S : Empty

export type Extends = { [key: string]: (this: App, ...args: any) => any }

/*** Build Effect ***/

export interface BuildEffect {

    readonly config?: { [key: string]: SchemaFor<unknown> }

    readonly services?: { [key: string]: (app: App) => Service }

    readonly extend?: Extends
}

export type ToBuildEffect<C extends { config?: Config, services?: Services, extends?: Extends }> = {

    [K in keyof BuildEffect as K extends keyof C ? K : never]:

    K extends 'config' 
        ? { [Kx in keyof C['config']]: SchemaFor<C['config'][Kx]> }

        : K extends 'services'
            ? { [Kx in keyof C['services']]: (app: App) => C['services'][Kx] }

            : C['extends']
}

type _MergeBuildEffects<C extends BuildComponents> = Merge<{
    [K in keyof C]: C[K] extends BuildComponent<infer B>  
        ? Required<B>
        : Empty
}>

export type FromBuildEffect<C extends BuildComponents> = {
    [K in keyof BuildEffect]-?: K extends keyof _MergeBuildEffects<C> 
        
        ? {
            [Kx in keyof _MergeBuildEffects<C>[K]]: 

            // Configuration 
            K extends 'config'
                ? _MergeBuildEffects<C>[K][Kx] extends { validate: (input: unknown) => infer R } 
                    ? R 
                    : unknown 
                
            // Services
                : K extends 'services' 
                    ? _MergeBuildEffects<C>[K][Kx] extends (...args: any) => infer S 
                        ? S extends Service 
                            ? S 
                            : never
                        : never

                // Extensions
                    : _MergeBuildEffects<C>[K][Kx]
        }
        
        : Empty
}

/*** Build Context ***/

export type BuildLifecycleMethod = (app: App) => void

export interface BuildContext extends Required<BuildEffect> {
    readonly required: BuildComponents
    readonly onConfigure: readonly BuildLifecycleMethod[]
    // readonly onDatabase: readonly AppInitializer[]
    // readonly onRegister: readonly AppInitializer[]
}
