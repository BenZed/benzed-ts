import {
    TypeSchema,
    TypeValidator,
} from '@benzed/schema'

import { Func, isFunc } from '@benzed/util'

//// Helper ////

class ObjectValidator extends TypeValidator<Func> {

    isValid(input: unknown): input is Func {
        return isFunc(input)
    }

}

//// Exports ////

export class Function extends TypeSchema<ObjectValidator, {}> {

    constructor() {
        super(new ObjectValidator, {})
    }

}

export const $function = new Function