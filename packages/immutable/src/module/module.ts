import {
    Func,
    nil 
} from '@benzed/util'

import { 
    $$copy, 
    copy,
    copyWithoutState,
    getShallowState,
    setState, 
    Struct 
} from '@benzed/immutable'

import { 
    $$parent,
    applyParentProxy,
    Parentable,
    isParentable
} from './parent'

//// Types ////

interface Module extends Struct, Parentable {}

interface ModuleConstructor {

    is(i: unknown): i is Module

    new (): Module 
    new <F extends Func>(signature: F): Module & F
}

//// Helper ////

const isModule = (i: unknown): i is Module => 
    Struct.is(i) && isParentable(i)

//// Module ////

/**
 * Implementation of module that automatically sets the parent
 * of any defined parentable properties.
 */
const Module = new Proxy(class Module extends Struct {

    static override is = isModule

    readonly [$$parent] = nil

    override [$$copy](): this {

        const blank = copyWithoutState(this)
        const module = applyParentProxy(blank)

        const state = copy(getShallowState(this))
        setState(module, state)

        return module as this
    }

}, {

    construct(target, args, constructor) {
        const instance = Reflect.construct(target, args, constructor)
        return applyParentProxy(instance)
    }

}) as ModuleConstructor

//// Exports ////

export {

    isModule,
    Module,

    ModuleConstructor
}