
/* eslint-disable @typescript-eslint/no-explicit-any */

type Validator = (...args: any[]) => (input: unknown) => input is unknown

/*** Main ***/

const describeValidator = <T extends Validator>(options: {
    factory: T
    input: Parameters<T>
    data: [value: unknown, result: boolean][]
    describe?: string
}): void => {

    const description =
        options.describe ??
        `creates a ${options.factory.name ?? ''}`.trim() + ' validator'

    describe(description, () => {

        const validator = options.factory(...options.input)

        for (const [value, result] of options.data) {
            it(`${JSON.stringify(value)} ${result ? 'pass' : 'fail'}`, () => {
                expect(validator(value)).toBe(result)
            })
        }
    })
}

/*** Exports ***/

export {
    describeValidator
}