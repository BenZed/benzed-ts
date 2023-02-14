import { showStateKeys } from '@benzed/immutable'
import { $$settings, TypeValidator } from '@benzed/schema'
import { pick } from '@benzed/util'

//// Types ////

export type TypeCast = ConfigurableTypeValidator<unknown>['cast']

export type TypeDefault = ConfigurableTypeValidator<unknown>['default']

//// Main ////

export abstract class ConfigurableTypeValidator<T> extends TypeValidator<T> {

    override name: string

    constructor() {
        super()

        this.name = this
            .constructor
            .name
            .replace('Configurable', '')
            .replace('Validator', '')
            .replace('Schema', '')

        showStateKeys(this, 'cast', 'default', 'message')
    }

    get [$$settings](): Pick<this, 'name' | 'message' | 'cast' | 'default'> {
        return pick(this, 'name', 'message', 'cast', 'default')
    }

}

//// Exports ////
