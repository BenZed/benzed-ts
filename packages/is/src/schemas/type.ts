import { 
    Schema, 
    SchemaBuilder, 
    SchemaInput, 
    
    SubValidators,
    ValidateOutput,
    ValidationErrorMessage,
} from '@benzed/schema'

import { isFunc, OutputOf } from '@benzed/util'

import { 
    AnySettingsValidator, 
    AnyTypeValidator, 
    NameMessageEnabledSignature, 
    toNameMessageEnabled, 
    TypeDefault 
} from '../validators'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Hack ////

type Settings = any // <- having to do this is annoying TODO

//// Exports ////

export class SettingsSchema<V extends AnySettingsValidator, S extends SubValidators<V>> extends Schema<V,S> {

    named(name: string): this {
        return this._applyMainValidator({ name } as Settings)
    }

    message(message: string | ValidationErrorMessage<SchemaInput<V>>): this {
        return this._applyMainValidator({ message } as Settings)
    }

    //// Helper ////

    protected _applyBasicSubValidator(key: keyof S, ...sig: NameMessageEnabledSignature<OutputOf<V>>): this {
        const nameMessageEnabled = toNameMessageEnabled(...sig as Settings)
        //                                                 ^ still not 100% on why this is necessary TODO
        return this._applySubValidator(
            key,
            nameMessageEnabled as Settings
        )
    }

}

export class SettingsSchemaBuilder<V extends AnySettingsValidator, S extends SubValidators<V>> extends SchemaBuilder<V,S> {

    named(name: string): this {
        return this._applyMainValidator({ name } as Settings)
    }

    message(message: string | ValidationErrorMessage<SchemaInput<V>>): this {
        return this._applyMainValidator({ message } as Settings)
    }

    //// Helper ////

    protected _applyBasicSubValidator(key: keyof S, ...sig: NameMessageEnabledSignature<OutputOf<V>>): this {
        const nameMessageEnabled = toNameMessageEnabled(...sig)
        return this._applySubValidator(
            key,
            nameMessageEnabled
        )
    }

}

//// TypesSchema ////

export class TypeSchema<T extends AnyTypeValidator, S extends SubValidators<T>> extends SettingsSchemaBuilder<T, S> {

    default(getDefault: ValidateOutput<T> | TypeDefault): this {

        return this._applyMainValidator({ 
            default: isFunc(getDefault) 
                ? getDefault 
                : () => getDefault 
        } as Settings)
    }

    cast(cast: TypeDefault): this {
        return this._applyMainValidator({ cast } as Settings)
    }

}