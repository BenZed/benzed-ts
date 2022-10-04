
import { HookContext } from '@feathersjs/feathers'

/* eslint-disable 
    @typescript-eslint/no-explicit-any, 
    @typescript-eslint/explicit-function-return-type
*/

/**
 * Create a time stamp for this property
 */
export const timestamp = () => Promise.resolve(new Date())

export const pipeResolvers = <T, R>(
    ...resolvers: ((value: T | undefined, record: R, context: HookContext) =>
    Promise<T | undefined>)[]
) => async (value: T | undefined, record: R, context: HookContext) => {

    for (const resolver of resolvers)
        value = await resolver(value, record, context)

    return value
}
