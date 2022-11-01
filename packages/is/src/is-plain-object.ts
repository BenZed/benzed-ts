import { isFunction, isObject } from './is-basic'

//// Main ////

function isPlainObject<T extends object>(input: unknown): input is T {

    if (!isObject(input))
        return false

    if (isFunction(Object.getPrototypeOf)) {
        const proto = Object.getPrototypeOf(input)
        return proto === Object.prototype || proto === null
    }

    return Object.prototype.toString.call(input) === `[object Object]`
}

//// Main ////

export default isPlainObject

export { isPlainObject }