import { isObject } from '@benzed/is'

/*** Exports ***/

export default function shapeOf<T>(
    shape: { [K in keyof T]: (input: unknown) => input is T[K] }
): (input: unknown) => input is T {

    return (input: unknown): input is T => {

        if (!isObject<Partial<T>>(input))
            return false

        for (const key in shape) {
            const validator = shape[key]

            const pass = validator(input[key])
            if (!pass)
                return false
        }

        return true
    }
}

export { shapeOf }

