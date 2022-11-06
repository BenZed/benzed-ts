import {
    feathers,
    NextFunction,
    HookContext,
    Params,
} from '@feathersjs/feathers'

import configuration from '@feathersjs/configuration'
import {
    koa,
    rest,
    bodyParser,
    errorHandler,
    parseAuthentication as authParser,

    Application as KoaApplication
} from '@feathersjs/koa'

import { MemoryService } from '@feathersjs/memory'
import { AdapterParams } from '@feathersjs/adapter-commons'

//// Types ////

export type TestApplication<S extends readonly string[]> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    KoaApplication<{ [K in S[number]]: MemoryService<any> }>

declare module '@feathersjs/memory' {
    interface MemoryService
    /**/ //eslint-disable-next-line @typescript-eslint/no-explicit-any        
    /**/ <T = any, D = Partial<T>, P = AdapterParams> {

        update(id: null, data: D, params?: P): Promise<T[]>
        // TODO FIXME
        // I don't know how long this will be necessary for, but the current MemoryService 
        // definition doesn't match that of other services, which causes type errors

    }
}

//// Helper ////

export const createTestApp = <S extends readonly string[]>(
    services: S
): TestApplication<S> => {

    const testApp = koa(feathers())

    testApp.configure(configuration())
    testApp.configure(rest())

    testApp.use(errorHandler())
    testApp.use(authParser())
    testApp.use(bodyParser())

    for (const service of services)
        testApp.use(service, new MemoryService({ paginate: { default: 20, max: 100 } }))

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
        type: `i-dont-think-this-is-used-anymore` as HookContext<unknown>['type'],
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