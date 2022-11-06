
/* eslint-disable 
    @typescript-eslint/no-explicit-any, 
    @typescript-eslint/explicit-function-return-type
*/

/**
 * Create a time stamp for this property
 */
export const timestamp = () => Promise.resolve(new Date())

export const pipeResolvers = <T, R, C>(
    ...resolvers: ((value: T | undefined, record: R, context: C) =>
    Promise<T | undefined>)[]
) => async (value: T | undefined, record: R, context: C) => {

    for (const resolver of resolvers)
        value = await resolver(value, record, context)

    return value
}
