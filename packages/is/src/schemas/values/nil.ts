import { ValueSchema, ValueValidator } from '@benzed/schema'
import { asNil, isNil, nil } from '@benzed/util'

////  ////

class NilValidator extends ValueValidator<nil> {

    constructor() {
        super(nil)
    }

    override transform(input: unknown) {
        return this.force ? this.value : asNil(input)
    }

    override isValid(input: unknown): boolean {
        return isNil(input)
    }

}

export class Nil extends ValueSchema<NilValidator> {
    constructor() {
        super(
            new NilValidator,
            {}
        )
    }
}

export const $nil = new Nil