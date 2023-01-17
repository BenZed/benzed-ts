import { Callable, Func, isFunc, isSymbol, KeysOf, keysOf, nil, Property, symbolsOf, TypeGuard, TypeOf } from '@benzed/util'
import { CallableStruct, Struct } from '@benzed/immutable'

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
            return this.ref.is(i)
        })

        // Untangle
        const This = this.constructor as new (ref: T) => this
        while (ref instanceof This)
            ref = ref.ref
        this.ref = ref

        // Inherit
        this._refInherit()
    }

    //// Convenience ////

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
        const isDescriptors = Property.descriptorsOf(this.constructor.prototype)

        for (const prop of keysOf(refDescriptors)) {
            if (prop in isDescriptors)
                continue

            const key = prop as KeysOf<T>

            const refDescriptor = refDescriptors[key]

            const isMethod = isFunc(refDescriptor.value)
            const isGetter = !isMethod && isFunc(refDescriptor.get)

            const descriptor = isMethod 
                ? this._createRefMethodDescriptor(key, refDescriptor)
                : isGetter 
                    ? this._createRefAccessorDescriptor(key, refDescriptor)
                    : refDescriptor

            if (descriptor)
                Property.define(this, key, descriptor)
        }
    }

    protected _createRefMethodDescriptor(key: KeysOf<T>, input: PropertyDescriptor): PropertyDescriptor | nil {

        return {
            ...input,
            value: (...args: unknown[]) => { 
                const output = (this.ref[key] as Func)(...args)
                return this._wrapIfSchematic(output)
            }
        }
    }

    protected _createRefAccessorDescriptor(key: KeysOf<T>, input: PropertyDescriptor): PropertyDescriptor | nil {
        return {
            ...input,
            get: () => this._wrapIfSchematic(this.ref[key]),
            set: 'set' in input 
                ? (value: unknown) => {
                    (this.ref as any)[key] = value
                }
                : nil
        }
    }

    private _wrapIfSchematic(output: unknown): unknown {
        return Schematic.is(output)
            ? this._wrap(output)
            : output
    }

    protected _wrap(output: AnySchematic): this {
        const This = this.constructor as new (ref: AnySchematic) => this
        return new This(output)
    }
    
}

//// Exports ////

export default Ref

export {
    Ref
}