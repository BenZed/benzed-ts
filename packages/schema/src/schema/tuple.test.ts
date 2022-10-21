
import TupleSchema from './tuple'
import ShapeSchema from './shape'
import NumberSchema from './number'
import StringSchema from './string'

import { expectValidationError } from '../util.test'
import EnumSchema from './enum'

/*** Input ***/

const $name = new TupleSchema([new StringSchema(), new StringSchema()])

describe(`validate()`, () => {

    it(`validates tuples`, () => {
        expect($name.validate([`first-name`, `last-name`]))
            .toEqual([`first-name`, `last-name`])
    })

    it(`validates children`, () => {
        const expectError = expectValidationError(() => $name.validate([{
            toString() {
                return `object`
            }
        }, `one`]))
        expectError.toHaveProperty(`path`, [0])
        expectError.toHaveProperty(`message`, `must be a string`)
    })

    it(`validates nested children`, () => {

        const $vector = new ShapeSchema({
            x: new NumberSchema().mutable,
            y: new NumberSchema().mutable
        })

        const $edge = new TupleSchema([$vector, $vector] as const)

        expectValidationError(
            () => $edge.validate([
                { x: 0, y: 1 },
                { x: 0, y: `One` },
            ])
        ).toHaveProperty(`path`, [1, `y`])
    })
})

describe(`default()`, () => {

    it(`defaults to constructed tuple`, () => {

        expect(
            $name.default()
                .validate(undefined)
        ).toEqual([``, ``])
    })

    it(`default constructed object respects nested default values`, () => {

        const $count = new TupleSchema([new StringSchema().default(`default`)])

        expect(
            $count
                .default()
                .validate(undefined)
        ).toEqual([`default`])
    })

    it(`respects default setting, if valid`, () => {
        expect(
            $name
                .default([`james`, `mcnaughty`])
                .validate(undefined)
        ).toEqual([`james`, `mcnaughty`])
    })

})

it(`values can be spread into new schemas`, () => {

    const $fancyName = new TupleSchema(
        [new EnumSchema([`Dr.`, `Mr.`, `Sir`, `Maam`]).default(`Dr.`), ...$name.values] as const
    )

    expect($fancyName.validate([undefined, `Joe`, `James`])).toEqual([`Dr.`, `Joe`, `James`])
})