import {
    TypeSchema,
    TypeValidator,
} from '@benzed/schema'

import { isBoolean } from '@benzed/util'

//// Helper ////

class BooleanValidator extends TypeValidator<boolean> {

    isValid(input: unknown): input is boolean {
        return isBoolean(input)
    }

}

//// Exports ////

export class Boolean extends TypeSchema<BooleanValidator, {}> {

    constructor() {
        super(new BooleanValidator, {})
    }

}

export const $boolean = new Boolean