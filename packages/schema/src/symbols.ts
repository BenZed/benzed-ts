
/**
 * Id of a validator, used for cases where updating a validator
 * means replacing another one
 */
export const $$id = Symbol('schema-validator-id')

/**
 * Id of the main validator in a schematic.
 */
export const $$mainId = Symbol('schema-main-validator-id')

/**
 * Property added to settings updates with additional sub validator configuration
 */
export const $$subConfig = Symbol('schema-apply-sub-validator-config')
