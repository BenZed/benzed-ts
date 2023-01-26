import { copy, Struct } from '@benzed/immutable'
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
    assign
} from '@benzed/util'

import { 
    AnyValidate, 
    AnyValidator, 
    AllowedValidatorSettings, 
    Validate, 
    ValidationErrorInput, 
    Validator, 
    ValidatorSettings
} from '../validator'

import Schema, { AnySchema } from './schema'

import SchemaCursor, { AnyValidatorPipe } from './schema-cursor'

//// Data ////

const $$child = Symbol('sub-validator-id')

//// Types ////

type SubValidatorInput = ValidationErrorInput<unknown> | boolean | object 

//// Helper ////

function getSettingsValidator(cursor: Iterable<AnyValidate>): AnyValidator {
    const [ settingsValidtor ] = cursor 
    return settingsValidtor
}

function getSubValidatorOptions(input: SubValidatorInput = {}): object {
    const options = isString(input) || isFunc(input)
        ? { error: input }
        : isBoolean(input)
            ? {}
            : input

    return options
}

function createSubValidator(input: SubValidatorInput, cursor: AnySchema, key: string, $$sub: symbol): AnyValidate | nil {
    
    const enabled = isBoolean(input) ? input : true
    if (!enabled)
        return nil

    const settings = getSettingsValidator(cursor) as unknown as Record<string, AnyValidate>
    const options = getSubValidatorOptions(input)

    const template = settings[key]

    const subValidator = new Validator({ ...template, ...options })
    if (subValidator) {
        Property.define(
            subValidator, 
            $$child, { value: $$sub, enumerable: true, configurable: true } 
        )
    }

    return subValidator
}

function addAccessor(schema: AnySchema, descriptor: PropertyDescriptor, key: string, name: string): void {

    const isValidator = descriptor.value instanceof Validate

    const $$sub = isValidator ? Symbol(key) : nil

    const setter = function (this: AnySchema, value: unknown): unknown {

        const newSettings = { [key]: value } as AllowedValidatorSettings<AnySchema>

        const [ settingsValidator, ...rest ] = this

        const updatedSettingsValidator = Validator.apply(settingsValidator, newSettings)

        const validate = Pipe.from(Validator.merge(updatedSettingsValidator, ...rest))

        return Validator.apply(this, { validate })
    }
    
    Property.name(setter, `${isValidator ? 'apply' : 'set'}${capitalize(key)}`)
    Property.define(schema, name, { enumerable: false, value: setter, configurable: true, writable: true })
}

function getAccessibleDescriptors(settings: object): PropertyDescriptorMap {

    const descriptors = Property.descriptorsOf(settings)

    const nonAccessibleKeys = iterate(keysOf(descriptors), key => { 
        const descriptor = descriptors[key]
        const accessible = descriptor.writable || 'getter' in descriptor && 'setter' in descriptor
        return !accessible || DISALLOWED_KEYS.includes(key as typeof DISALLOWED_KEYS[number]) ? key : nil
    })

    return omit(descriptors, ...nonAccessibleKeys)

}

//// Main ////

function ensureAccessors(cursor: AnySchema, settings: object): void {

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
    getSettingsValidator,
    DISALLOWED_KEYS
}