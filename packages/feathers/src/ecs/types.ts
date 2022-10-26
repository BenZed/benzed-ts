
import FeathersBuildModule, { FeathersModules } from './module'

import { SchemaFor } from '@benzed/schema'
import { Empty, Merge } from '@benzed/util'

import { App, Extends, Service, ServiceInterface } from '../types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Build Effect ***/

export interface BuildEffect<A extends App = App> {

    readonly config?: { [key: string]: SchemaFor<unknown> }

    readonly services?: { [key: string]: (app: A) => Service | ServiceInterface }

    readonly extends?: Extends<A>

}

export type ToBuildEffect<E extends { config?: object, services?: object, extends?: object }> = {

    [Ek in keyof BuildEffect as Ek extends keyof E ? Ek : never]:

    Ek extends 'config' 
        ? { [Ekx in keyof E['config']]: SchemaFor<E['config'][Ekx]> }

        : Ek extends 'services'
            ? { [Ekx in keyof E['services']]: (app: App) => E['services'][Ekx] }

            : E['extends']
}

type _MergeBuildEffects<C extends FeathersModules> = Merge<{
    [Ck in keyof C]: C[Ck] extends FeathersBuildModule<infer B>  
        ? Required<B>
        : Empty
}>

export type FromBuildEffect<C extends FeathersModules> = {

    [Ck in keyof BuildEffect]-?: Ck extends keyof _MergeBuildEffects<C> 
        
        ? { [Ckx in keyof _MergeBuildEffects<C>[Ck]]: 

            // Configuration 
            Ck extends 'config'
                ? _MergeBuildEffects<C>[Ck][Ckx] extends { validate: (input: unknown) => infer R } 
                    ? R 
                    : unknown 
                
            // Services
                : Ck extends 'services' 
                    ? _MergeBuildEffects<C>[Ck][Ckx] extends (...args: any) => infer S 
                        ? S extends Partial<Service> 
                            ? S 
                            : never
                        : never

                // Extensions
                    : _MergeBuildEffects<C>[Ck][Ckx] extends (...args: infer A) => infer R 
                        ? (...args: A) => R
                        : _MergeBuildEffects<C>[Ck][Ckx]
        }
        
        : Empty
}

/*** Build Context ***/

export type LifeCycleMethod<A extends App = App> = (app: A) => void
export type CreateLifeCycleMethod<A extends App = App> = (app: A) => A | void

export interface FeathersBuildContext extends Required<BuildEffect> {
    readonly onCreate: readonly CreateLifeCycleMethod[]
    readonly onConfig: readonly LifeCycleMethod[]
    // readonly onDatabase: readonly AppInitializer[]
    // readonly onRegister: readonly AppInitializer[]
}
