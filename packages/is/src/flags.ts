
import { Schema } from './schema'

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

type MethodFlag = Flag.Is | Flag.Assert | Flag.Validate
type WriteFlag = Flag.Readonly | Flag.Mutable
type ExistFlag = Flag.Optional | Flag.Required

type Flags = [
    MethodFlag,
    WriteFlag,
    ExistFlag
]

type DefaultFlags = [Flag.Is, Flag.Readonly, Flag.Required]

type SetFlag<FS extends Flags, F extends Flag> = F extends MethodFlag
    ? [F, FS[1], FS[2]]
    : F extends WriteFlag
    ? [FS[0], F, FS[2]]
    : F extends ExistFlag
    ? [FS[0], FS[1], F]
    : unknown

type IsFlag<FS extends Flags, F extends Flag, Y, N = unknown> =
    F extends MethodFlag
    ? FS[0] extends F ? Y : N
    : F extends WriteFlag
    ? FS[1] extends F ? Y : N
    : F extends ExistFlag
    ? FS[2] extends F ? Y : N
    : N

type ResolveFlags<T> =
    T extends Flags
    ? T

    : T extends Schema<any, infer F2>
    ? F2

    : [unknown, unknown, unknown]

type GetMethodFlag<T> = ResolveFlags<T>[0]
type GetWriteFlag<T> = ResolveFlags<T>[1]
type GetExistFlag<T> = ResolveFlags<T>[2]

/*** Exports ***/

export {
    Flag,
    Flag as F,
    Flags,

    MethodFlag,
    WriteFlag,
    ExistFlag,

    SetFlag,
    IsFlag,

    GetMethodFlag,
    GetExistFlag,
    GetWriteFlag,

    DefaultFlags
}