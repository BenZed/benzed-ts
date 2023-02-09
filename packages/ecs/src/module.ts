import { Func, GenericObject, Mutable, namesOf, NamesOf, nil, Property } from '@benzed/util'
import { $$copy, copy, copyWithoutState, getShallowState, setState, Struct } from '@benzed/immutable'

//// Symbols ////

const $$parent = Symbol('parent')

//// Types ////

interface Module extends Struct {

    readonly [$$parent]: Module | nil

}

interface ModuleConstructor {

    is(i: unknown): i is Module

    new (): Module 
    new <F extends Func>(signature: F): Module & F
}

type ModuleChildren<T extends Module> = {
    [K in NamesOf<T> as T[K] extends Module ? K : never]: T[K]
}

//// Helper ////

function getChildren<T extends Module>(module: T): ModuleChildren<T> {

    const children: GenericObject = {}

    for (const name of namesOf(module)) {
        if (isModule(module[name]))
            children[name] = module[name]
    }

    return children as ModuleChildren<T>
}

function * eachChild<T extends Module>(module: T): Generator<Module> {
    
    const children = getChildren(module)
    for (const name in children)
        yield children[name] as Module

}

function setParent(child: Module, parent: Module | nil): void {
    Property(
        child,
        $$parent,
        {
            enumerable: true,
            value: parent,
            configurable: true,
            writable: false
        }
    )
}

function getParent<T extends Module>(module: T): T[typeof $$parent] {
    return module[$$parent]
}

const isModule = (i: unknown): i is Module => 
    Struct.is(i) && $$parent in i

//// Node ////

const applyParentSync = (module: Module): Module => {
    const syncedModule = new Proxy(module, {
        defineProperty(module, key, attr) {

            if (isModule(attr.value) && key !== $$parent) 
                setParent(attr.value, syncedModule)

            return Reflect.defineProperty(module, key, attr)
        }
    })

    setParent(syncedModule, nil)
    return syncedModule
}

const Module = new Proxy(class Module extends Struct {

    static override is = isModule

    readonly [$$parent] = nil
    
    override [$$copy](): this {

        const blank = copyWithoutState(this)
        const module = applyParentSync(blank)

        const state = copy(getShallowState(this))
        setState(module, state)

        return module as this
    }

}, {
    construct(target, args, constructor) {
        const instance = Reflect.construct(target, args, constructor)
        return applyParentSync(instance)
    }

}) as unknown as ModuleConstructor

//// Exports ////

export {

    isModule,
    Module,

    ModuleConstructor,
    ModuleChildren,

    $$parent,
    getParent,
    setParent,

    getChildren,
    eachChild
}