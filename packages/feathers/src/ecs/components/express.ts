import { Express as ExpressApp } from 'express'

import { Application as FeatherApp } from '@feathersjs/feathers'
import express, { ExpressOverrides } from '@feathersjs/express'

import { CreateLifeCycleMethod } from '../types'
import { RestComponent } from './provider'
import { Services } from '../../types'
import { FeathersComponents } from '../component'

/*** Apps ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/**
 * Keys that we won't need.
 */
type ExpressAppSuperfluousKeys = keyof FeatherApp | 'listen' | 'use' | 'get' | 'set'

/**
 * Extensions from the Express class object that are not feathers application properties
 */
type ExpressAppExtends = {
    [K in keyof ExpressApp as K extends ExpressAppSuperfluousKeys ? never : K]: ExpressApp[K]
}
/**
 * Added behind the scenes via the _onCreate method
 */
interface ExpressExtends extends ExpressOverrides<Services>, ExpressAppExtends {}

/*** Main ***/

class Express<C extends FeathersComponents> extends RestComponent<ExpressExtends, C> {

    protected _onValidateComponents(): void {
        this._assertSingle()
        this._assertConflicting(RestComponent)
    }

    /*** Lifecycle Methods ***/

    protected _onCreate: CreateLifeCycleMethod<any> = (app: any) => express(app) as any

    /*** Build Implementation ***/

    protected _createBuildExtends(): ExpressExtends {
        return {} as ExpressExtends
    }

}

/*** Exports ***/

export default Express

export {
    Express,
    ExpressExtends
}