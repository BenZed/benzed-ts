
import BuildComponent, { BuildComponents } from './build-component'

import { SchemaFor } from '@benzed/schema'
import { Empty, Merge } from '@benzed/util'

import { App, Config, Extends, Services, Service } from '../types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** App ***/

/*** Build Effect ***/

export interface BuildEffect<A extends App = App> {

    readonly config?: { [key: string]: SchemaFor<unknown> }

    readonly services?: { [key: string]: (app: A) => Service }

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

type _MergeBuildEffects<C extends BuildComponents> = Merge<{
    [Ck in keyof C]: C[Ck] extends BuildComponent<infer B>  
        ? Required<B>
        : Empty
}>

export type FromBuildEffect<C extends BuildComponents> = {
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
                        ? S extends Service 
                            ? S 
                            : never
                        : never

                // Extensions
                    : _MergeBuildEffects<C>[Ck][Ckx] extends (...args: infer A) => infer R 
                        ? (...args: A) => R
                        : () => void
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
