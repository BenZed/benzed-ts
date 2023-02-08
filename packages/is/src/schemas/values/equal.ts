import { $$settings, Schema, ValueValidator } from '@benzed/schema'
import { pick, Primitive } from '@benzed/util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Validator ////

class Value <T extends Primitive> extends ValueValidator<T> {

    override readonly name: string

    get [$$settings](): Pick<this, 'name' | 'message' | 'force'> {
        return pick(this, 'name', 'message', 'force', 'value')
    }

    constructor(value: T, force: boolean) {
        super(value, force)
        this.name = String(value)
    }

}

//// Schema ////

interface Equal<T extends Primitive> extends Schema<Value<T>, {}> {

    force(force: boolean): this

}

const Equal = class Equal <T extends Primitive> extends Schema<Value<T>, {}> {

    constructor(value: T) {
        super(
            new Value(value, false), 
            {}
        )
    }

} as new <T extends Primitive>(value: T) => Equal<T>

//// Exports ////

export {
    Equal
}