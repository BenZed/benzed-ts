
import {
    HookContext,
    Paginated,
    Service,
} from '@feathersjs/feathers'
import { toPaginated } from '../util'

/**
 * Ensure this field is unique
 * @param targetField 
 * @returns 
 */
export const isUnique = <T extends string | number | boolean, S extends Service>(
    targetField: string
) => async (
    value: T | undefined,
    _record: unknown,
    context: HookContext<unknown, S>
) => {

    if (value !== undefined && value !== ``) {

        const { service, id } = context

        const result = await service.find({
            query: {
                [targetField]: value,
                $select: [`_id`],
            }
        }).then(toPaginated) as Paginated<{ _id: string }>

        const foundIds = result.data.map(({ _id }) => _id)

        const isUnique = foundIds
            .filter(_id => !id || id !== _id)
            .length === 0

        if (!isUnique)
            throw new Error(`must be unique`)
    }

    return value
}
