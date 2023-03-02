import {
    TypeSchema,
    TypeValidator,
} from '@benzed/schema'

import { isObject } from '@benzed/util'

//// Helper ////

class ObjectValidator extends TypeValidator<object> {

    isValid(input: unknown): input is object {
        return isObject(input)
    }

}

//// Exports ////

export class Obj extends TypeSchema<ObjectValidator, {}> {

    constructor() {
        super(new ObjectValidator, {})
    }

}

export const $object = new Obj