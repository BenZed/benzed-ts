
/**
 * Get the type the object is validating
 */
export type ValidatesType<T> = T extends (input: unknown) => input is infer U ? U : unknown
