import { Func, isFunc, KeysOf, keysOf, merge, Mutable, nil, Property, TypeOf } from '@benzed/util'

import { AnySchematic, Schematic } from '../../schema'
import { ValidateOptions } from '../../validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper ////

/**
 * Get property descriptions of string indexed keys following 
 * public naming conventions of every prototype in the chain
 * of the given schematic. 
 * @internal
 */
export const getSchematicExtensionDescriptors = (schematic: AnySchematic): PropertyDescriptorMap => {

    const Constructor = schematic.constructor

    const descriptors: PropertyDescriptorMap = {}

    let extendsSchematic = false
    for (const prototype of Property.eachPrototype(Constructor.prototype)) {
        if (prototype === Schematic.prototype) {
            extendsSchematic = true
            break
        }
        
        const protoDescriptors = Property.descriptorsOf(prototype)
        for (const key of keysOf(protoDescriptors)) {
            if (key in descriptors === false)
                descriptors[key] = protoDescriptors[key]
        }
    }

    for (const key of keysOf(descriptors)) {
        if (key === 'constructor' || key === 'prototype' || key.startsWith('_'))
            delete descriptors[key]
    }

    if (!extendsSchematic)
        throw new Error(`${schematic?.name} does not extend ${Schematic.name}`)

    return descriptors
}

//// RefSchematic ////

/**
 * Schematic that exposes/transforms properties of it's reference schematic 
 * for it's own purposes
 */
abstract class Ref<T> extends Schematic<T> {

    protected static _normalize(ref: AnySchematic): AnySchematic {
        while (ref instanceof this)
            ref = ref.ref
        return ref
    }

    readonly ref: Schematic<T>

    constructor(ref: Schematic<T>) {

        ref = Ref._normalize(ref)

        // unwrap
        super(ref.validate)

        this.ref = ref
        this._inheritRefDescriptors()
    }

    //// Struct Overrides ////

    override get state(): Partial<this> {
        // the default behaviour is that any enumerable
        // property is state, which will cause an infinite 
        // loop when trying to collect state for _inheritRefDescriptors
        return {
            ref: this.ref
        } as Partial<this>
    }

    override copy(): this {
        return this._copyWithRef(this.ref)
    }

    //// Helper ////

    private _inheritRefDescriptors(): void {

        const refDescriptors = getSchematicExtensionDescriptors(this.ref)
        const thisDescriptors = getSchematicExtensionDescriptors(this)

        const descriptors: PropertyDescriptorMap = {}

        for (const prop of keysOf(refDescriptors)) {
            if (prop in thisDescriptors)
                continue

            const key = prop as KeysOf<Schematic<T>>

            const refDescriptor = refDescriptors[key]

            const isMethod = isFunc(refDescriptor.value)
            const isGetter = !isMethod && isFunc(refDescriptor.get)

            const descriptor = isMethod 
                ? this._createRefMethodDescriptor(key, refDescriptor)
                : isGetter 
                    ? this._createRefAccessorDescriptor(key, refDescriptor)
                    : refDescriptor

            if (descriptor) 
                descriptors[key] = descriptor
        }

        Property.define(this, descriptors)
    }

    protected _createRefMethodDescriptor(
        key: KeysOf<Schematic<T>>, 
        input: PropertyDescriptor
    ): PropertyDescriptor | nil {

        return {
            ...input,
            value: (...args: unknown[]) => { 
                const output = (this.ref[key] as Func)(...args)
                return this._copyWithRefIfSchematic(output)
            }
        }
    }

    protected _createRefAccessorDescriptor(key: KeysOf<Schematic<T>>, input: PropertyDescriptor): PropertyDescriptor | nil {
        return {
            ...input,
            get: () => this._copyWithRefIfSchematic(this.ref[key]),
            set: 'set' in input 
                ? (value: unknown) => {
                    (this.ref as any)[key] = value
                }
                : nil
        }
    }

    private _copyWithRefIfSchematic(output: unknown): unknown {
        return Schematic.is(output)
            ? this._copyWithRef(output as Schematic<T>)
            : output
    }

    protected _copyWithRef(ref: Schematic<T>): this {
        const clone = super.copy()

        ref = Ref._normalize(ref)

        merge(clone, { 
            ref,
            validate: ref.validate
        })

        clone._inheritRefDescriptors()
        return clone
    }
}

//// Exports ////

export default Ref

export {
    Ref
}