import { StringKeys } from "@benzed/util/lib"
import _Module, { ModuleConstructor, ModuleParams, Modules } from "./module"

type Types = {
    [key: string]: ModuleConstructor | _Module
}

type Node<T extends Types, M extends Modules> = _Module & {
    modules: M
} & {
    [K in StringKeys<T> as `use${K}`]: T[K] extends _Module 
        ? <I extends (i: T[K]) => _Module>(init: I) => Node<T, [...M, ReturnType<I>]>
        : T[K] extends ModuleConstructor 
            ? (...params: ModuleParams<T[K]>) => Node<T, [...M, InstanceType<T[K]>]>
            : never
}

class Test extends _Module {

    constructor(count: number) {
        super(count)
    }
}

class Cake extends _Module {
    constructor(slices: string) {
        super(slices)
    }
}

type App = {
    Test: typeof Test
    Cake: typeof Cake
}

type Service<T extends string> = {
    Cake: typeof Cake
    App: typeof app
}

function defineNode<T extends Types>(types: T): Node<T, []> {
    return null as unknown as Node<T, []>
}

const app = defineNode<App>({ Test, Cake })

const defineService = <T extends string>(t: T): Node<Service<T>, []> => defineNode<Service<T>>({ Cake, App: app })

const a2 = app
    .useTest(1)
    .useTest(2)
    .useCake(`slices`)

const service = defineService(`users`)

const s2 = service.useApp(app => app.useCake(`one`).useTest(1))

const s3 = s2.useCake(`12`)
