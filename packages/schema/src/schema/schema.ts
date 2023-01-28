
import {
    nil,
    omit,
    keysOf,
    provide,
} from '@benzed/util'

import { 
    $$copy 
} from '@benzed/immutable'

import { 
    $$id, 
    $$subConfig, 
    defineSymbol 
} from '../symbols'

import {
    assertSubvalidatorId,
    resolveSubvalidatorId,
    Validator, 
    ValidatorPipe, 
    ValidatorSettings, 
    VALIDATOR_DISALLOWED_SETTINGS_KEYS
} from '../validator'

import {
    AnyValidate, 
    Validate, 
} from '../validator/validate'

import { createSchemaSetters } from './schema-setters'

import { 
    SchemaConstructor, 
    SchemaProperties, 
    SchemaSetters, 
    SchemaSettingsInput,
    SchemaSettingsOutput,
    SubValidatorConstructor
} from './schema-types'
import { E } from '@benzed/math'
import { SubValidator } from '../validators'

//// Type ////

type Schema<I, O, T extends SchemaSettingsInput<O> | ValidatorSettings<I,O>> = 
    SchemaProperties<I, O, T> & 
    SchemaSetters<I,O,T>

//// Helper ////

const isEnabled = provide((key: string) => (validator: AnyValidate) => $$subConfig in validator && validator[$$subConfig] === key)

function schemaSettingsOutput(input: object, validators: AnyValidate[]): SchemaSettingsOutput<object> {

    const output = { ...input } as Record<string, object>
    for (const key of keysOf(output)) {
        const isValidator = output[key] instanceof Validate
        const existing = validators.find(isEnabled(key))

        if (isValidator && existing)
            output[key] = schemaSettingsOutput(existing, validators)
    
        else if (isValidator && !existing)
            delete output[key]
    }

    return omit(output, ...VALIDATOR_DISALLOWED_SETTINGS_KEYS)
}

//// Implementation ////

const Schema = class extends ValidatorPipe<unknown, unknown> {

    constructor(settings: object) {
        super(settings)
        createSchemaSetters(this, settings)
    } 

    override get name(): string {
        const [ mainValidator ] = this.validators
        return mainValidator.name
    }

    get settings(): SchemaSettingsOutput<object> {
        const [ mainValidator ] = this.validators
        return schemaSettingsOutput(mainValidator, this.validators)
    }
    
    //// Apply ////
    
    override apply(settings: object): this {

        const [ firstValidator, ...validators ] = this.validators

        const { key: subKey, enabled: subEnabled, construct } = $$subConfig in settings 
            ? settings[$$subConfig] as { key?: string, enabled: boolean, construct?: unknown[] }
            : { key: nil, enabled: true, construct: nil } as const

        const isModifyingSubValidator = subKey !== nil
        if (isModifyingSubValidator) {

            const existingSubValidator = validators.find(isEnabled(subKey))
            if (!subEnabled && existingSubValidator) {
                const id = assertSubvalidatorId(existingSubValidator)
                return this.remove(id as symbol)
            } else if (!subEnabled)
                return this

            const mainValidator = firstValidator as any

            const newSubValidator = construct 
                ? new mainValidator[subKey](...construct)
                : existingSubValidator 
                    ? Validator.apply(existingSubValidator, settings)
                    : Validator.apply(mainValidator[subKey], settings)

            const validatorWithId = existingSubValidator ?? newSubValidator
            
            const id = validatorWithId && $$id in validatorWithId 
                ? validatorWithId[$$id] 
                : subKey

            defineSymbol(newSubValidator, $$subConfig, subKey)
            defineSymbol(newSubValidator, $$id, id)
            return this.validates(newSubValidator, id)
        } else {

            const newMainValidator = Validator.apply(firstValidator, settings)
            return this.validates(newMainValidator)
        }

    }

    //// Value Copy ////
    
    protected [$$copy](): this {
        const clone = super[$$copy]()

        const [ mainValidator ] = this.validators
        createSchemaSetters(clone, mainValidator)

        return clone
    }

} as unknown as SchemaConstructor

//// Exports ////

export default Schema 

export {
    Schema
}