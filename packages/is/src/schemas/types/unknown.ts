import {
    TypeSchema,
    TypeValidator,
} from '@benzed/schema'

import { isUnknown } from '@benzed/util'

//// Helper ////

class UnknownValidator extends TypeValidator<unknown> {

    isValid(input: unknown): input is boolean {
        return isUnknown(input)
    }

}

//// Exports ////

export class Unknown extends TypeSchema<UnknownValidator, {}> {

    constructor() {
        super(new UnknownValidator, {})
    }

}

export const $unknown = new Unknown