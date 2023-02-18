import { define, isObject, nil } from '@benzed/util'

//// Symbols ////

const $$parent = Symbol('parent')

//// Types ////

interface Parentable {
    readonly [$$parent]: Parentable | nil
}

//// Helper ////

function setParent(child: Parentable, parent: Parentable | nil): void {
    define(
        child,
        $$parent,
        {
            value: parent,
            enumerable: false,
            configurable: true,
            writable: false
        }
    )
}

function isParentable(input: unknown): input is Parentable {
    return isObject(input) && $$parent in input
}

/**
 * Wrap an object in a proxy that automatically sets itself
 * as the parent of any properties defined on it that are
 * parentable
 */
function applyParentProxy<T extends Parentable>(input: T): T {

    const output = new Proxy(input, {
        defineProperty(parentable, key, attr) {

            const { value } = attr
            if (isParentable(value) && key !== $$parent) 
                setParent(value, output)

            return Reflect.defineProperty(parentable, key, attr)
        }
    })

    setParent(output, nil)
    return output
}

//// Exports ////

export {

    $$parent,
    Parentable,
    isParentable,

    setParent,
    applyParentProxy,
}