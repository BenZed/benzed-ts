
/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Exports ***/

export default function oneOf<T extends any[]>(
    ...validators: {
        [K in keyof T]: (input: unknown) => input is T[K]
    }
): (input: unknown) => input is T[number] {

    return (input: unknown): input is T[number] => {
        for (const validator of validators) {
            if (validator(input))
                return true
        }

        return false
    }
}

export { oneOf, oneOf as or }