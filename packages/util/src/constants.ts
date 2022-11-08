
export const IS_NODE = typeof process === 'object'

// @ts-expect-error window is not defined
export const IS_BROWSER = typeof window === 'object'