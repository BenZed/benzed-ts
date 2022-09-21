
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/indent 
*/

/*** Enum ***/

enum Flag {
    Is,
    Assert,
    Validate,

    Readonly,
    Mutable,

    Optional,
    Required
}

/***Types  ***/

type Flags = [
    Flag.Is | Flag.Assert | Flag.Validate,
    Flag.Readonly | Flag.Mutable,
    Flag.Optional | Flag.Required
]

type DefaultFlags = [Flag.Is, Flag.Readonly, Flag.Required]

type SetFlag<FS extends Flags, F extends Flag> = F extends Flag.Is | Flag.Assert | Flag.Validate
    ? [F, FS[1], FS[2]]
    : F extends Flag.Readonly | Flag.Mutable
    ? [FS[0], F, FS[2]]
    : F extends Flag.Optional | Flag.Required
    ? [FS[0], FS[1], F]
    : unknown

type IsFlag<FS extends Flags, F extends Flag, Y, N = unknown> =
    F extends Flag.Is | Flag.Assert | Flag.Validate
    ? FS[0] extends F ? Y : N
    : F extends Flag.Readonly | Flag.Mutable
    ? FS[1] extends F ? Y : N
    : F extends Flag.Optional | Flag.Required
    ? FS[2] extends F ? Y : N
    : N

/*** Exports ***/

export {
    Flag,
    Flag as F,
    Flags,

    SetFlag,
    IsFlag,

    DefaultFlags
}