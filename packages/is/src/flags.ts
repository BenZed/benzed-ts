
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

/*** Exports ***/

export {
    Flag,
    Flag as F,
    Flags,
    DefaultFlags
}