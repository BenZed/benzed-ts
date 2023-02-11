import { GenericObject, NamesOf, namesOf, nil } from '@benzed/util'

import { Module, isModule } from './module'
import { $$parent } from './parent'

//// Types ////

/**
 * Any property of a given module that is also a module
 */
export type Children<T extends Module> = {
    [K in NamesOf<T> as T[K] extends Module ? K : never]: T[K]
}

export type Parent<P extends Module> = P[typeof $$parent] extends Module 
    ? P[typeof $$parent]
    : nil

export type ModulePath = readonly string[]

//// Getters ////

export function getChildren<T extends Module>(module: T): Children<T> {

    const children: GenericObject = {}

    for (const name of namesOf(module)) {
        if (isModule(module[name]))
            children[name] = module[name]
    }

    return children as Children<T>
}

export function getParent<T extends Module>(parentable: T): Parent<T> {
    const parent = parentable[$$parent]
    return (isModule(parent) ? parent : nil) as Parent<T>
}

export function getRoot<T extends Module>(module: T): Module {

    const root = Array
        .from(eachParent(module))
        .reverse()
        .at(-1) ?? module
    
    return root
}

export function getPath(module: Module, from?: Module): ModulePath {

    const path: string[] = []

    let foundFrom = false
    for (const parent of eachParent(module)) {

        const children = getChildren(parent)
        for (const name of namesOf(children)) {
            if (children[name] === module) {
                path.push(name)
                break
            }
        }

        if (parent === from) {
            foundFrom = true
            break
        }
    }

    if (from && !foundFrom)
        throw new Error('Given reference module is not a parent of the input module.')

    return path.reverse()
}

//// Iterators ////

export function * eachChild<T extends Module>(module: T): Generator<Module> {

    const children = getChildren(module)
    for (const name in children)
        yield children[name] as Module

}

export function * eachParent<T extends Module>(module: T): Generator<Module> {

    let parent = getParent(module)
    while (parent) {
        yield parent as Module
        parent = getParent(module)
    }

}

export function * eachSibling<T extends Module>(module: T): Generator<Module> {

    const parent = getParent(module)
    if (parent) {
        for (const child of eachChild(parent)) {
            if (child !== module)
                yield child
        }
    }

}

export function * eachAncestor<T extends Module>(module: T): Generator<Module> {

    for (const parent of eachParent(module)) {
        yield parent
        yield* eachSibling(parent)
    }

}

export function * eachDescendent<T extends Module>(module: T): Generator<Module> {

    yield* eachChild(module)
    for (const child of eachChild(module)) 
        yield* eachDescendent(child)

}

/**
 * From any module in the tree, iterate through every module in a given
 * module's tree. 
 */
export function * eachModule<T extends Module>(module: T): Generator<Module> {
    const root = getRoot(module)
    yield root
    yield* eachDescendent(root)
}
