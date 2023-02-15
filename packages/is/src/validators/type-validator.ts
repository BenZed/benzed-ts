import { showStateKeys } from '@benzed/immutable'
import { $$settings, TypeValidator as StatelessTypeValidator } from '@benzed/schema'
import { pick } from '@benzed/util'

//// Types ////

export type TypeCast = TypeValidator<unknown>['cast']

export type TypeDefault = TypeValidator<unknown>['default']

//// Main ////

export abstract class TypeValidator<T> extends StatelessTypeValidator<T> {

    override name: string

    constructor() {
        super()

        this.name = this
            .constructor
            .name
            .replace('Validator', '')
            .replace('Schema', '')

        showStateKeys(this, 'cast', 'default', 'message')
    }

    get [$$settings](): Pick<this, 'name' | 'message' | 'cast' | 'default'> {
        return pick(this, 'name', 'message', 'cast', 'default')
    }

}