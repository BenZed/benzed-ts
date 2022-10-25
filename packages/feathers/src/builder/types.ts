
import BuildComponent, { BuildComponents } from "./build-component"

import { SchemaFor } from '@benzed/schema'
import { Empty, Merge } from '@benzed/util'

import { App, Config, Extends, Services, Service } from "../types"

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** App ***/

/*** Build Effect ***/

export interface BuildEffect<A extends App = App> {

    readonly config?: { [key: string]: SchemaFor<unknown> }

    readonly services?: { [key: string]: (app: A) => Service }

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
