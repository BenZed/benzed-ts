import { Application as FeatherApp } from '@feathersjs/feathers'
        
import {
    koa,
    rest,
    bodyParser,
    errorHandler,
    parseAuthentication as authParser,
    ApplicationAddons as KoaAppAddons,

} from '@feathersjs/koa'

import type KoaApp from 'koa'

import { CreateLifeCycleMethod, LifeCycleMethod } from '../types'

import type { Server } from 'http'
import { RestComponent } from './provider'
import { FeathersComponents } from '../component'

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

class Koa<C extends FeathersComponents> extends RestComponent<KoaExtends, C> {

    protected _onValidateComponents(): void {
        this._assertSingle()
        this._assertConflicting(RestComponent)
    }

    /*** Lifecycle Methods ***/

    protected _onCreate: CreateLifeCycleMethod = (app: any) => 
        koa(app) as any
   
    protected _onConfig: LifeCycleMethod = (app: any) => {
        app.configure(rest())
        app.use(errorHandler())
        app.use(authParser())
        app.use(bodyParser())
    }

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