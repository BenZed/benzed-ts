
import { FeathersAppBuilder } from './app-builder'

export const feathers = {
    app: FeathersAppBuilder.create(),
    // service: FeathersServiceBuilder.create()
}

export default feathers

export * from './app-builder'
export * from './builds'

export * from './module'
export * from './app-modules'

export * from './types'

