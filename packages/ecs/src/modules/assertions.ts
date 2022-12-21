import Module from '../module/module'

/**
 * Module is the only instance of it's kind on it's parent
 */
export function isSingle(module: Module): void {

    if (module.siblings.some(sibling => sibling instanceof module.constructor)) {
        throw new Error(
            `${module.name} cannot be placed with other ${module.name} modules.`
        )
    }

}

export function isRootLevel(module: Module): void {
    if (module.parent !== module.root)
        throw new Error(`${module.name} must be a root level module.`)
}
