import { Flags } from './flags'
import Schema from './schema'

for (const [Flag, getFlagKey, addFlagKey] of [
    [Flags.Optional, 'isOptional', 'optional'],
    [Flags.Mutable, 'isMutable', 'mutable']
] as const) {

    describe(`Flags.${Flags[Flag]}`, () => {

        class NullSchema<F extends Flags[] = []> extends Schema<null, null, F> {
            public constructor (...flags: F) {
                super(
                    null,
                    ...flags
                )
            }
        }

        const schemaWithFlag = new NullSchema(Flag)
        const schemaWithoutFlag = new NullSchema()

        describe(`.${getFlagKey}`, () => {

            for (const [currSchema, result] of [
                [schemaWithFlag, true],
                [schemaWithoutFlag, false]
            ] as const) {
                it(
                    `returns ${result} if flags ` +
                    `${result ? 'do' : 'do not'} ` +
                    `include Flags.${Flags[Flag]}`, () => {
                        expect(currSchema['_flags'].includes(Flag))
                            .toEqual(currSchema[getFlagKey])
                    }
                )
            }
        })

        describe(`.${addFlagKey}()`, () => {

            it(
                'creates a new instance of the schema ' +
                `with ${Flags[Flag]} flag`,
                () => {
                    expect(schemaWithFlag[getFlagKey]).toBe(true)
                    expect(schemaWithFlag).not.toBe(schemaWithoutFlag)
                }
            )

            it('instance is of extended class', () => {
                expect(schemaWithFlag).toBeInstanceOf(NullSchema)
            })

            it('cannot be called on instances with flag', () => {
                expect(() => schemaWithFlag[addFlagKey]())
                    .toThrow(`Schema is already ${Flags[Flag]}`)
            })

        })
    })
}
