import { Callable, isFunc, isSymbol, KeysOf, keysOf, nil, Property, symbolsOf, TypeGuard, TypeOf } from '@benzed/util'
import { CallableStruct, Struct } from '@benzed/immutable'
import { capitalize } from '@benzed/string'

import { AnySchematic, Schematic } from '../../schema'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// RefSchematic ////

/**
 * Schematic that exposes/transforms properties of it's reference schematic 
 * for it's own purposes
 */
abstract class Ref<T extends AnySchematic> extends Callable<TypeGuard<TypeOf<T>>> {

    readonly ref: T

    constructor(ref: T) {

        // unwrap
        super(function refIs(
            this: Ref<T>, 
            i
        ): i is TypeOf<T> {
            return this.ref(i)
        })

        // Untangle
        const This = this.constructor as new (ref: T) => this
        while (ref instanceof This)
            ref = ref.ref
        this.ref = ref

        // Inherit
        this._refInherit()
    }

    //// Abstract ////

    protected abstract _callRefMethod(key: keyof T): (...args: unknown[]) => unknown
    protected abstract _getRefValue(key: keyof T): () => unknown
    protected abstract _setRefValue(key: keyof T): (value: unknown) => void

    //// Convenience ////

    protected _wrapIfSchematic(output: unknown): unknown {
        const This = this.constructor as new (ref: AnySchematic) => this
        return Schematic.is(output)
            ? new This(output) 
            : output
    }

    protected _getRefDescriptors(): PropertyDescriptorMap {
        const protos = Property.prototypesOf(
            this.ref.constructor.prototype, 
            [
                Object.prototype,
                Function.prototype,
                Struct.prototype,
                CallableStruct.prototype,
                Schematic.prototype
            ]
        )

        const refDescriptors = Property.descriptorsOf(this.ref, ...protos)

        const keys = keysOf(refDescriptors)
        const symbols = symbolsOf(refDescriptors)

        const IGNORE_KEYS = ['constructor', 'prototype']

        for (const key of [...keys, ...symbols]) {
            if (
                isSymbol(key) ||
                key.startsWith('_') ||
                IGNORE_KEYS.includes(key)
            ) 
                delete refDescriptors[key]
        }

        return refDescriptors
    }

    //// Helper ////

    private _refInherit(): void {

        const refDescriptors = this._getRefDescriptors()
        const isDescriptors = Property.descriptorsOf(this)

        for (const prop of keysOf(refDescriptors)) {
            if (prop in isDescriptors)
                continue

            const key = prop as KeysOf<T>

            const refDescriptor = refDescriptors[key]

            const isMethod = isFunc(refDescriptor.value)
            const isGetter = !isMethod && isFunc(refDescriptor.get)

            const descriptor = isMethod 
                ? {
                    ...refDescriptor,
                    value: Property.name(this._callRefMethod(key), `ref${capitalize(key)}`)
                }
                : isGetter 
                    ? {
                        ...refDescriptor,
                        get: this._getRefValue(key),
                        set: 'set' in refDescriptor 
                            ? this._setRefValue(key)
                            : nil
                    }
                    : refDescriptor

            Property.define(this, key, descriptor)
        }
    }
    
}

//// Exports ////

export default Ref

export {
    Ref
}