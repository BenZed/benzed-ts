import { Func, isFunc, KeysOf, keysOf, merge, nil, Property,} from '@benzed/util'

import { AnySchematic, Schematic } from '../../schema'
import { Validate } from '../../validator'

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

    const descriptors: PropertyDescriptorMap = Property.descriptorsOf(schematic)
    
    let extendsSchematic = false

    const Constructor = schematic.constructor
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

/**
 * Schematic that exposes/transforms properties of it's reference schematic 
 * for it's own purposes
 */
abstract class Ref<T> extends Schematic<T> {

    readonly ref: Schematic<T>

    constructor(ref: Schematic<T>) {
        super(ref.validate)
        this.ref = this._assertRef(ref)
        this._inheritRefDescriptors()
        this._assignValidate() 
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

    //// Convenience ////

    protected _copyWithRef(ref: Schematic<T>): this {
        const clone = super.copy()

        merge(clone, { 
            ref: clone._assertRef(ref)
        })
        clone._inheritRefDescriptors()
        clone._assignValidate()
        return clone
    }

    protected _setValidate(): Validate<unknown, T> {
        return this.ref.validate
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

    protected _copyWithRefIfSchematic(output: unknown): unknown {
        return Schematic.is(output)
            ? this._copyWithRef(output as Schematic<T>)
            : output
    }

    //// Helper ////
    
    private _assignValidate(): void {
        merge(
            this,
            {
                validate: this._setValidate()
            }
        )
    }

    private _assertRef(ref: AnySchematic): AnySchematic {
        if (ref instanceof this.constructor)
            throw new Error(`${this.constructor.name} cannot reference an instance of itself.`)
        return ref
    }

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

}

//// Exports ////

export default Ref

export {
    Ref
}