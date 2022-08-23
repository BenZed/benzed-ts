import {
    NextFunction,
    HookContext,
    Params,
} from '@feathersjs/feathers'

import createMongoApplication, { MongoApplication } from './mongo-app'
import setupMongoService, { MongoService } from './mongo-service'

/*** Types ***/

export type TestApplication<S extends readonly string[]> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MongoApplication<{ [K in S[number]]: MongoService<any> }>

/*** Helper ***/

export const createTestApp = <S extends readonly string[]>(
    services: S
): TestApplication<S> => {

    const testApp = createMongoApplication()

    for (const service of services)
        setupMongoService(testApp, { collection: service })

    return testApp as TestApplication<S>
}

export const createTestHookContext = <S extends string>(config: {
    app?: TestApplication<[S]>
    serviceName: S
    method: HookContext<TestApplication<[S]>>['method']
    params?: Params
}): HookContext<TestApplication<[S]>> => {

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