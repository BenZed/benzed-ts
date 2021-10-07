import { isFunction, isObject } from './is-basic'

/*** Main ***/

function isPlainObject<T = unknown>(input: unknown): input is Record<string | number, T> {

    if (!isObject(input))
        return false

    if (isFunction(Object.getPrototypeOf)) {
        const proto = Object.getPrototypeOf(input)
        return proto === Object.prototype || proto === null
    }

    return Object.prototype.toString.call(input) === '[object Object]'
}

/*** Main ***/

export default isPlainObject

export { isPlainObject }