import { feathers, NextFunction } from '@feathersjs/feathers'
import express from '@feathersjs/express'
import socketio from '@feathersjs/socketio'
import configuration from '@feathersjs/configuration'
import '@feathersjs/transport-commons'

import { Service as MemoryService } from 'feathers-memory'

import {
    Application,
    HookContext,
    Params,
    Service
} from './types'

/*** Types ***/

export type TestApp = Application

/*** Helper ***/

export const createTestApp = (serviceNames = ['users']): TestApp => {
    const testApp = express(feathers()) as unknown as TestApp

    testApp.configure(configuration())
    testApp.configure(socketio())
    testApp.on('connection', (connection) => {
        testApp.channel('all').join(connection)
    })
    testApp.publish(() => testApp.channel('all'))

    for (const serviceName of serviceNames) {
        testApp.use(serviceName, new MemoryService({
            id: '_id',
            multi: true,
            paginate: {
                default: 10,
                max: 100
            }
        }) as unknown as Service)
    }

    return testApp
}

export const createTestHookContext = (config: {
    app?: TestApp
    serviceName: string
    method: HookContext<TestApp>['method']
    params?: Params
}): HookContext<TestApp> => {

    const {
        serviceName,
        app = createTestApp([serviceName]),
        method,
        params = {},
    } = config

    return {
        app,
        service: app.service(serviceName),
        method,
        event: method,
        path: serviceName,
        params,
        type: 'i-dont-think-this-is-used-anymore' as HookContext<unknown>['type'],
        arguments: []
    }

}

export const createTestNextFunction = (): NextFunction & { calls: number } => {

    const next: NextFunction & { calls: number } = (): Promise<void> => {
        next.calls++
        return Promise.resolve()
    }
    next.calls = 0

    return next
}