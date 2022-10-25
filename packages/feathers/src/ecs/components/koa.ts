import { Application as FeatherApp } from '@feathersjs/feathers'
import { ApplicationAddons as KoaAppAddons, koa } from '@feathersjs/koa'
import type KoaApp from 'koa'

import { CreateLifeCycleMethod } from '../types'

import type { Server } from 'http'
import { FeathersRestComponent } from './provider'

/*** Apps ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/**
 * Keys that we won't need
 */
type KoaAppSuperfluousKeys = keyof FeatherApp | 'listen' 

/**
 * Extensions from the Koa class object that are not feathers application properties
 */
type KoaAppExtends = {
    [K in keyof KoaApp as K extends KoaAppSuperfluousKeys ? never : K]: KoaApp[K]
}
/**
 * Addons that are added behind the scenes via the _onCreate method
 */
interface KoaExtends extends Omit<KoaAppAddons, 'server'> , KoaAppExtends {
    server?: Server
}

/*** Main ***/

class Koa extends FeathersRestComponent<KoaExtends> {

    /*** Lifecycle Methods ***/

    protected _onCreate: CreateLifeCycleMethod = (app: any) => koa(app) as any

    /*** Build Implementation ***/

    protected _createBuildExtends(): KoaExtends {
        return {} as KoaExtends
    }

}

/*** Exports ***/

export default Koa

export {
    Koa,
    KoaExtends
}