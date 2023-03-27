
export const IS_NODE = typeof process === 'object'

// @ts-expect-error window is not defined
export const IS_BROWSER = typeof window === 'object'

export const ENV = process.env.NODE_ENV ?? 'development'

export const IS_DEV = ENV === 'development'

/**
 * Universals
 */
export const KB = 1024 // bytes
export const MB = 1024 * KB
export const GB = 1024 * MB