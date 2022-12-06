const InvalidTypeError = Symbol('invalid-type-error')
const Type = Symbol('required-target-type')

export type Invalid<msg extends string = 'This is an invalid type.', T = never> = T extends never 
    ? { [InvalidTypeError]: msg }
    : { [InvalidTypeError]: msg, [Type]: T }
