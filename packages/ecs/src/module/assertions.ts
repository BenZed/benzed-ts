import { Module } from './module'

/**
 * Module is the only instance of it's kind on it's parent
 */
export function isSingle(module: Module): void {

    if (module.node.findModules(module.constructor as new () => Module).length !== 1) {
        throw new Error(
            `${module.name} cannot be placed with other ${module.name} modules.`
        )
    }
}

export function isRootLevel(module: Module): void {
    if (module.node.hasParent)
        throw new Error(`${module.name} must be a root level module.`)
}
