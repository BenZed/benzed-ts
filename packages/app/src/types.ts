
/**
 * Given two string types, camel case them together if the first isn't empty
 */
export type CamelCombine<P extends string, K extends string> = 
    P extends '' 
        ? K 
        : `${P}${Capitalize<K>}`

export type Path = `/${string}`