import { Callable, ContextTransform } from '@benzed/util'

class Resolver<I, O, C> extends Callable<ContextTransform<I, O | Promise<O>, C>> {
    constructor() {

    }
}