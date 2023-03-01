import { Structural } from '@benzed/immutable'
import { TypeValidator as StatelessTypeValidator } from '@benzed/schema'
import { pick } from '@benzed/util'
import { SettingsValidator } from '.'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

export type TypeCast = TypeValidator<unknown>['cast']

export type TypeDefault = TypeValidator<unknown>['default']

//// Main ////

export abstract class TypeValidator<T> 
    extends StatelessTypeValidator<T> 
    implements SettingsValidator<unknown, T> {

    override name: string

    constructor() {
        super()

        this.name = this
            .constructor
            .name
            .replace('Validator', '')
            .replace('Schema', '')
    }

    get [Structural.state](): Pick<this, 'name' | 'message' | 'cast' | 'default'> {
        return pick(this, 'name', 'message', 'cast', 'default')
    }

}

export type AnyTypeValidator = TypeValidator<any>