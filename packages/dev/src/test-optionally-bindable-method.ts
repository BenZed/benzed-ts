
/* eslint-disable @typescript-eslint/ban-ts-ignore */

// @ts-ignore 
const describe = typeof window === 'object' ? window.describe : typeof global === 'object' ? global.object : self.object

/***************************************************************/
// Main
/***************************************************************/

export default function testOptionallyBindableMethod(
    method: Function,
    testFunction: Function
): void {
    describe(
        `optionally bindable method: ${method.name}`,
        () => {
            describe(
                `${method.name}(first, ...rest)`,
                () => testFunction(
                    (...args: unknown[]) => method.call(undefined, ...args)
                )
            )

            describe(
                `first::${method.name}(...rest)`,
                () => testFunction(
                    (that: unknown, ...rest: unknown[]) =>
                        method.call(that, ...rest)
                )
            )
        }
    )
}