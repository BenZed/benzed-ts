import { expectTypeOf } from 'expect-type'
import { DefaultFlags, SetFlag, IsFlag, F, Flags, Flag } from './flags'

/*** Types ***/

type AssertFlags = [F.Assert, F.Readonly, F.Required]
type ValidateFlags = [F.Validate, F.Readonly, F.Required]
type MutableFlags = [F.Is, F.Mutable, F.Required]
type OptionalFlags = [F.Is, F.Readonly, F.Optional]

/*** Test ***/

describe('IsFlag', () => {

    type HasFlag<FS extends Flags, F extends Flag> = IsFlag<FS, F, true, false>

    it('conditionally types depending on existing of is flag', () => {

        expectTypeOf<HasFlag<AssertFlags, F.Is>>().toMatchTypeOf<false>()
        expectTypeOf<HasFlag<DefaultFlags, F.Is>>().toMatchTypeOf<true>()

    })

    it('conditionally types depending on assert of is flag', () => {

        expectTypeOf<HasFlag<AssertFlags, F.Assert>>().toMatchTypeOf<true>()
        expectTypeOf<HasFlag<DefaultFlags, F.Assert>>().toMatchTypeOf<false>()

    })

    it('conditionally types depending on assert of validate flag', () => {

        expectTypeOf<HasFlag<ValidateFlags, F.Validate>>().toMatchTypeOf<true>()
        expectTypeOf<HasFlag<DefaultFlags, F.Validate>>().toMatchTypeOf<false>()

    })

    it('conditionally types depending on assert of mutable flag', () => {

        expectTypeOf<HasFlag<MutableFlags, F.Mutable>>().toMatchTypeOf<true>()
        expectTypeOf<HasFlag<DefaultFlags, F.Mutable>>().toMatchTypeOf<false>()

    })

    it('conditionally types depending on assert of readonly flag', () => {

        expectTypeOf<HasFlag<DefaultFlags, F.Readonly>>().toMatchTypeOf<true>()
        expectTypeOf<HasFlag<MutableFlags, F.Readonly>>().toMatchTypeOf<false>()

    })

    it('conditionally types depending on assert of required flag', () => {

        expectTypeOf<HasFlag<DefaultFlags, F.Required>>().toMatchTypeOf<true>()
        expectTypeOf<HasFlag<OptionalFlags, F.Required>>().toMatchTypeOf<false>()

    })

    it('conditionally types depending on assert of optional flag', () => {

        expectTypeOf<HasFlag<OptionalFlags, F.Optional>>().toMatchTypeOf<true>()
        expectTypeOf<HasFlag<DefaultFlags, F.Optional>>().toMatchTypeOf<false>()

    })

})

describe('SetFlag', () => {

    it('can change flag method type to assert', () => {

        const assertFlags: SetFlag<DefaultFlags, F.Assert> = [F.Assert, F.Readonly, F.Required]
        expectTypeOf(assertFlags).toEqualTypeOf<[F.Assert, F.Readonly, F.Required]>()
    })

    it('can change flag method type to is', () => {

        const isFlags: SetFlag<AssertFlags, F.Is> = [F.Is, F.Readonly, F.Required]
        expectTypeOf(isFlags).toEqualTypeOf<[F.Is, F.Readonly, F.Required]>()
    })

    it('can change flag method type to is', () => {

        const validateFlags: SetFlag<DefaultFlags, F.Validate> =
            [F.Validate, F.Readonly, F.Required]

        expectTypeOf(validateFlags).toEqualTypeOf<[F.Validate, F.Readonly, F.Required]>()
    })

    it('can change flag mutability type to mutable', () => {

        const mutableFlags: SetFlag<DefaultFlags, F.Mutable> =
            [F.Is, F.Mutable, F.Required]

        expectTypeOf(mutableFlags).toEqualTypeOf<[F.Is, F.Mutable, F.Required]>()
    })

    it('can change flag mutability type to mutable', () => {

        const mutableFlags: SetFlag<MutableFlags, F.Readonly> =
            [F.Is, F.Readonly, F.Required]

        expectTypeOf(mutableFlags).toEqualTypeOf<[F.Is, F.Readonly, F.Required]>()
    })

    it('can change flag optionality type to optional', () => {

        const optionalFlags: SetFlag<DefaultFlags, F.Optional> =
            [F.Is, F.Readonly, F.Optional]

        expectTypeOf(optionalFlags).toEqualTypeOf<[F.Is, F.Readonly, F.Optional]>()
    })

    it('can change flag optionality type to required', () => {

        const requiredFlags: SetFlag<OptionalFlags, F.Required> =
            [F.Is, F.Readonly, F.Required]

        expectTypeOf(requiredFlags).toEqualTypeOf<[F.Is, F.Readonly, F.Required]>()
    })

})
