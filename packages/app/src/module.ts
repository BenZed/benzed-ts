import { is } from '@benzed/is'

import { FindNode, HasNode, AssertNode, Node } from '@benzed/node'
import { Structural } from '@benzed/immutable'
import { Callable, Traits } from '@benzed/traits'
import { nil } from '@benzed/util'
import type { Client, Server } from './modules'

//// Main ////

/**
 * Module is the most base class of an Application.
 */
abstract class Module extends Traits.use(Node, Structural) {

    static readonly use = Traits.use
    static readonly add = Traits.add

    static readonly getState = Structural.get
    static readonly setState = Structural.set
    static readonly applyState = Structural.create

    static readonly parent: typeof Node.parent = Node.parent
    static readonly state: typeof Structural.state = Structural.state
    static readonly copy: typeof Structural.copy = Structural.copy
    static readonly equals: typeof Structural.equals = Structural.equals

    static nameOf(input: object): string {

        if ('name' in input && is.string(input.name))
            return input.name

        return input.constructor.name
    }

    constructor() {
        super()
        return Node.apply(this)
    }

    get name() {
        return this.constructor.name
    }

    get parent(): Module | nil {
        return Node.getParent(this)
    }

    get root(): Module {
        return Node.getRoot(this) as Module
    }

    get modules(): Module[] {
        return Array.from(Node.eachChild(this)) as Module[]
    }

    get find(): FindNode<Module> {
        return Node.find(this)
    }

    get has(): HasNode<Module> {
        return Node.has(this)
    }

    get assert(): AssertNode<Module> {
        return Node.assert(this)
    }

    get client(): Client | nil {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Client } = require('./modules/client') as typeof import('./modules/client')
        return this.root.find(is(Client))
    }

    get server(): Server | nil { 
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Server } = require('./modules/server') as typeof import('./modules/server')
        return this.root.find(is(Server))
    }

    //// Trait Implementations ////

    get [Structural.state](): {} {
        return { ...this }
    }

    [Structural.copy](): this {
        const clone = super[Structural.copy]()
        return Node.apply(clone)
    }
}

//// Extends ////

Callable[Traits.onUse](Module)

//// Exports ////

export default Module

export {
    Module
}
