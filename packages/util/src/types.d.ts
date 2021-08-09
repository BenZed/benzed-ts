
/**
 * Make a readonly type mutable
 */
export type Mutable<T> = {
    -readonly [P in keyof T]: T[P]
}
