import { Express as ExpressApp } from 'express'

import { Application as FeatherApp } from '@feathersjs/feathers'
import express, { ExpressOverrides } from '@feathersjs/express'

import { CreateLifeCycleMethod } from '../types'
import { FeathersRestComponent } from './provider'
import { Services } from '../../types'

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

class Express extends FeathersRestComponent<ExpressExtends> {

    /*** Lifecycle Methods ***/

    protected _onCreate: CreateLifeCycleMethod = (app: any) => express(app) as any

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