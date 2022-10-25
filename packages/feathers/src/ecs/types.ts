
import FeathersBuildComponent, { FeathersComponents } from './component'

import { SchemaFor } from '@benzed/schema'
import { Empty, Merge } from '@benzed/util'

import { App, Config, Extends, Service, ServiceInterface, Services } from '../types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** App ***/

/*** Build Effect ***/

export interface BuildEffect<A extends App = App> {

    readonly config?: { [key: string]: SchemaFor<unknown> }

    readonly services?: { [key: string]: (app: A) => Service | ServiceInterface }

    readonly extends?: Extends<A>

}

export type ToBuildEffect<E extends { config?: Config, services?: Services, extends?: Extends<any> }> = {

    [Ek in keyof BuildEffect as Ek extends keyof E ? Ek : never]:

    Ek extends 'config' 
        ? { [Ekx in keyof E['config']]: SchemaFor<E['config'][Ekx]> }

        : Ek extends 'services'
            ? { [Ekx in keyof E['services']]: (app: App) => E['services'][Ekx] }

            : E['extends']
}

type _MergeBuildEffects<C extends FeathersComponents> = Merge<{
    [Ck in keyof C]: C[Ck] extends FeathersBuildComponent<infer B, any>  
        ? Required<B>
        : Empty
}>

export type FromBuildEffect<C extends FeathersComponents> = {
    [Ck in keyof BuildEffect]-?: Ck extends keyof _MergeBuildEffects<C> 
        
        ? {
            [Ckx in keyof _MergeBuildEffects<C>[Ck]]: 

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

export type LifeCycleMethod = (app: App) => void
export type CreateLifeCycleMethod = (app: App) => App | void

export interface FeathersBuildContext extends Required<BuildEffect> {
    readonly required: FeathersComponents

    readonly onCreate: readonly CreateLifeCycleMethod[]
    readonly onConfig: readonly LifeCycleMethod[]
    // readonly onDatabase: readonly AppInitializer[]
    // readonly onRegister: readonly AppInitializer[]
}
