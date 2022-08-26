import { isObject } from '@benzed/is'

import { ValidatesType, Validator } from './types'

/*** Exports ***/

export default function recordOf<
    V extends Validator<unknown>,
    T extends { [key: string]: ValidatesType<V> }
>(validator: V): Validator<T> {

    return (input: unknown): input is T => {

        if (!isObject<Partial<T>>(input))
            return false

        for (const key in input) {
            const pass = validator(input[key])
            if (!pass)
                return false
        }

        return true
    }
}

export { recordOf }

