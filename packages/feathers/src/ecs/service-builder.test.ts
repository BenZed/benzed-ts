import { FeathersServiceBuilder } from './service-builder'
import { FeathersAppBuilder } from './app-builder'
import { Koa } from './app-modules'

//

it.todo(`does stuff`)

//

it(`allows the creation of extendable services`, () => {

    const app = FeathersAppBuilder.create()
    const service = FeathersServiceBuilder.create()

    class TodoService extends service.asBuildModule(`path`) {}

    const todoApp = app
        .use(Koa)
        .use(TodoService)

})