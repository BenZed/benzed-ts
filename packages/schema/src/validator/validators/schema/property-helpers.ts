import { Property } from '@benzed/util'

//// Exports ////

export function getAllProperties(
    object: object, 
    filter?: (
        descriptor: PropertyDescriptor, 
        key: string | symbol
    ) => boolean
): PropertyDescriptorMap {

    const prototypes = Property
        .prototypesOf(object)
        .concat(object)

    const descriptors = Property.descriptorsOf(...prototypes)

    const filteredDescriptors: PropertyDescriptorMap = {}

    for (const key in descriptors) {
        if (!filter || filter(descriptors[key], key))
            filteredDescriptors[key] = descriptors[key]
    }

    return filteredDescriptors
}
