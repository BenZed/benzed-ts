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

import { 
    AnyValidate, 
    AllowedValidatorSettings, 
    Validate, 
    ValidationErrorInput, 
    Validator,
    VALIDATOR_DISALLOWED_SETTINGS_KEYS, 
} from '../validator'

import { AnySchema } from './schema-types'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Data ////

const $$child = Symbol('sub-validator-id')

//// Types ////

type SubValidatorInput = ValidationErrorInput<unknown> | boolean | object 

//// Helper ////

function getSubValidatorOptions(input: SubValidatorInput = {}): object {
    const options = isString(input) || isFunc(input)
        ? { error: input }
        : isBoolean(input)
            ? {}
            : input

    return options
}

function createSubValidator(input: SubValidatorInput, schema: AnySchema, key: string, $$sub: symbol): AnyValidate | nil {
    
    const enabled = isBoolean(input) ? input : true
    if (!enabled)
        return nil

    const [ settings ] = schema.validators
    const options = getSubValidatorOptions(input)

    const template = (settings as any)[key]

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

        const [ settingsValidator, ...rest ] = this.validators

        const updatedSettingsValidator = Validator.apply(settingsValidator, newSettings)

        const validate = Pipe.from(Validator.merge(updatedSettingsValidator, ...rest))

        return this.apply({ validate })
    }
    
    Property.name(setter, `${isValidator ? 'apply' : 'set'}${capitalize(key)}`)
    Property.define(schema, name, { enumerable: false, value: setter, configurable: true, writable: true })
}

function getAccessibleDescriptors(settings: object): PropertyDescriptorMap {

    const descriptors = Property.descriptorsOf(settings)

    const nonAccessibleKeys = iterate(keysOf(descriptors), key => { 
        const descriptor = descriptors[key]
        const accessible = 
            !VALIDATOR_DISALLOWED_SETTINGS_KEYS.includes(key as any) &&
            (descriptor.writable || 'getter' in descriptor && 'setter' in descriptor) 

        return accessible ? key : nil
    })
    return omit(descriptors, ...nonAccessibleKeys)
}

//// Main //// 

function ensureAccessors(schema: AnySchema, settings: object): void {

    const descriptors = getAccessibleDescriptors(settings)

    console.log(descriptors)

    for (const key of keysOf(descriptors)) {

        const descriptor = descriptors[key]

        const name = key === 'name' ? 'named' : key
        const hasAccessor = name in schema
        if (!hasAccessor)
            addAccessor(schema, descriptor, key, name)
    }
}

//// Exports ////

export default ensureAccessors

export {
    ensureAccessors
}