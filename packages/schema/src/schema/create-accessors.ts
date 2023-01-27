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
    Func,
} from '@benzed/util'
import { $$constructor, $$subConfig, defineSymbol } from '../symbols'

import { 
    Validate, 
    VALIDATOR_DISALLOWED_SETTINGS_KEYS, 
} from '../validator'

import { AnySchema } from './schema-types'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type SubValidatorInput = string | Func | boolean | object 

//// Helper ////

function getSubValidatorOptions(input: SubValidatorInput = {}, setting: any): object {
    const options = isString(input)
        ? { error: input }
        : isBoolean(input)
            ? {}
            : isFunc(input)
                ? input(setting) 
                : input 

    return options
}

function addAccessor(schema: AnySchema, descriptor: PropertyDescriptor, key: string, name: string): void {

    const setter = function (this: AnySchema, ...values: unknown[]): unknown {

        const [ mainValidator ] = this
        
        const setting = (mainValidator as any)[key]
        const isValidator = setting instanceof Validate
        const isValidatorConstructor = isFunc(setting) && $$constructor in setting
        const options = isValidatorConstructor 
            ? {}
            : isValidator 
                ? getSubValidatorOptions(values[0] as SubValidatorInput, setting) 
                : { [key]: values[0] }

        if (isValidator || isValidatorConstructor) {
            const construct = isValidatorConstructor ? values : nil
            const enabled = isBoolean(values[0]) && values.length === 1 ? values[0] : true
            defineSymbol(options, $$subConfig, { key, enabled, construct })
        }

        return this.apply(options)
    }

    const isValidator = descriptor.value instanceof Validate
    Property.name(setter, `${isValidator ? 'apply' : 'set'}${capitalize(key)}`)
    Property.define(
        schema, 
        name, 
        { 
            enumerable: false, 
            value: setter, 
            configurable: true, 
            writable: true 
        })
}

function getAccessibleDescriptors(settings: object): PropertyDescriptorMap {

    const descriptors = Property.descriptorsOf(settings)

    const nonAccessibleKeys = iterate(keysOf(descriptors), key => { 
        const descriptor = descriptors[key]
        const accessible = 
            !VALIDATOR_DISALLOWED_SETTINGS_KEYS.includes(key as any) &&
            descriptor.writable || 'getter' in descriptor && 'setter' in descriptor

        return accessible ? nil : key
    })

    return omit(descriptors, ...nonAccessibleKeys)
}

//// Main //// 

function createAccessors(schema: AnySchema, settings: object): void {

    const descriptors = getAccessibleDescriptors(settings)

    for (const key of keysOf(descriptors)) {

        const descriptor = descriptors[key]

        const name = key === 'name' ? 'named' : key
        const hasAccessor = name in schema
        if (!hasAccessor)
            addAccessor(schema, descriptor, key, name)
    }
}

//// Exports ////

export default createAccessors

export {
    createAccessors
}