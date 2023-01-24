import { capitalize } from '@benzed/string'

import {
    Property,
    keysOf,
    omit,
    iterate,
    nil,
    isBoolean,
    isString,
    isFunc,
    Pipe,
} from '@benzed/util'

import { AnyValidate, ValidationErrorInput, Validator } from '../validator'

import { AnyCursor, AnyValidatorPipe } from './cursor'

//// Data ////

const DISALLOWED_KEYS = [
    'transform', 
    'isValid',
    'id', 
    'asserts', 
    'validates', 
    'transforms',
    'constructor',
    'copy',
    'equals',
    'prototype'
]

const $$child = Symbol('sub-validator-id')

//// Types ////

type SubValidatorInput = ValidationErrorInput<unknown> | boolean | object 

//// Helper ////

function getSettingsValidator(cursor: { validate: AnyValidatorPipe }): AnyValidate {
    return cursor.validate.transforms[0]
}

function getSubValidatorOptions(input: SubValidatorInput = {}): object {
    const options = isString(input) || isFunc(input)
        ? { error: input }
        : isBoolean(input)
            ? {}
            : input

    return options
}

function createSubValidator(input: SubValidatorInput, cursor: AnyCursor, key: string, $$sub: symbol): AnyValidate | nil {
    
    const enabled = isBoolean(input) ? input : true
    const settings = getSettingsValidator(cursor) as unknown as Record<string, AnyValidate>
    const options = getSubValidatorOptions(input)

    const template = settings[key]

    const subValidator = enabled 
        ? new Validator({ ...template, ...options })
        : nil
    if (subValidator) {
        Property.define(
            subValidator, 
            $$child, { value: $$sub } 
        )
    }

    return subValidator
}

function addAccessor(cursor: AnyCursor, descriptor: PropertyDescriptor, key: string, name: string): void {

    const isValidator = descriptor.value instanceof Validator

    const $$sub = isValidator ? Symbol(key) : nil

    const setter = isValidator
        ? function (this: AnyCursor, input:SubValidatorInput = {}): unknown {

            const validator = createSubValidator(input, this, key, $$sub as symbol)

            // Update cursor validate
            const validators = Array.from(this.validate.transforms)

            // Add or remove validator
            const index = validators.findIndex(v => $$child in v && v[$$child] === $$sub)
            if (index >= 0)
                validators.splice(index, 1, ...validator ? [validator] : [])
            else if (index < 0 && validator)
                validators.push(validator)

            const validate = Pipe.from(...validators)

            // Copy cursor
            const cursor = this.copy()
            cursor['state'] = { validate } as typeof cursor.state 
            return cursor
        } 
        
        : function (this: AnyCursor, value: unknown): unknown {
            return this.apply({ [key]: value })
        }
    
    Property.name(setter, `${isValidator ? 'apply' : 'set'}${capitalize(key)}`)
    Property.define(cursor, name, { enumerable: false, value: setter })
}

function getAccessibleDescriptors(settings: object): PropertyDescriptorMap {

    const descriptors = Property.descriptorsOf(settings)

    const nonAccessibleKeys = iterate(keysOf(descriptors), key => { 
        const descriptor = descriptors[key]
        const accessible = descriptor.writable || 'getter' in descriptor && 'setter' in descriptor
        return !accessible || DISALLOWED_KEYS.includes(key) ? key : nil
    })

    return omit(descriptors, ...nonAccessibleKeys)

}

//// Main ////

function ensureAccessors(cursor: AnyCursor, settings: object): void {

    const descriptors = getAccessibleDescriptors(settings)

    for (const key of keysOf(descriptors)) {

        const descriptor = descriptors[key]

        const name = key === 'name' ? 'named' : key
        const hasAccessor = name in cursor
        if (!hasAccessor)
            addAccessor(cursor, descriptor, key, name)

    }
}

//// Exports ////

export default ensureAccessors

export {
    ensureAccessors,
    getSettingsValidator
}