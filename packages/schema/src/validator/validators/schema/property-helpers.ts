import { Property } from '@benzed/util'

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

export function hideProperty(
    object: object,
    key: string | symbol
): PropertyDescriptor {
    Property.configure(object, key, { enumerable: false })
    return Property.descriptorOf(object, key) as PropertyDescriptor
}
export function showProperty(
    object: object,
    key: string | symbol
): PropertyDescriptor {
    Property.configure(object, key, { enumerable: true })
    return Property.descriptorOf(object, key) as PropertyDescriptor
}