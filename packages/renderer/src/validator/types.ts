
export type Validator<T> = (input: unknown) => input is T

export type Asserter<T> = (input: unknown) => asserts input is T

/**
 * Get the type the object is validating
 */
export type ValidatesType<T> = T extends Validator<infer U> ? U : unknown
