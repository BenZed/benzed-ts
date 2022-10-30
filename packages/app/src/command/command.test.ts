import $ from '@benzed/schema/lib'
import { HttpMethod } from '../modules/connection/server/http-methods'
import { Command, CommandData, CommandResult, CommandResultCode } from './command'

import { expectTypeOf } from 'expect-type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

it(`is sealed`, () => {
    // @ts-expect-error Sealed
    void class extends Command<'bad', object, object> {}
})

describe(`.create()`, () => {

    it(`sets name`, () => {
        const hello = Command.create(`hello-world`)
        expect(hello.name).toEqual(`hello-world`)
    })

    it(`name must be dash case`, () => {
        expect(() => Command.create(`camelCase`)).toThrow(`must be dash case`)
    })

    describe(`simple commands`, () => {
        const foo = Command.create(`get-foo`)

        it(`ensures object is data`, () => {
            expect(foo.validateData({})).toEqual({})
            expect(foo.validateData({ id: 100 })).toEqual({ id: 100 })
            expect(() => foo.validateData(100)).toThrow()
        })

        it(`assumes correct result`, () => {
            expect(foo.validateResult(100)).toEqual(100)
        })

        it(`has default to request behaviour`, () => {
            expect(foo.toReq({ id: 1 })).toEqual([HttpMethod.Get, `/foo/1`, {}])
            expect(foo.toReq({ })).toEqual([HttpMethod.Get, `/foo`, {}])
        })

        it(`has default from request behaviour`, () => {
            expect(foo.fromReq([HttpMethod.Get, `/foo/1`, { }])).toEqual({ id: `1` })
            expect(foo.fromReq([HttpMethod.Get, `/foo`, { }])).toEqual({ })
            expect(foo.fromReq([HttpMethod.Get, `/not-foo`, { }])).toEqual(null)
            expect(foo.fromReq([HttpMethod.Post, `/foo`, { }])).toEqual(null)
        })

    })

})

describe(`.data()`, () => {

    const getPizza = Command
        .create(`get-pizza`)
        .data(
            $({ 
                slices: $.number.range(0, 8)
            }).validate
        )

    it(`adds data validation`, () => {

        const data = getPizza.validateData({ slices: 5 })

        expect(data).toEqual({ slices: 5 })
        expect(() => getPizza.validateData({ slices: -1 })).toThrow()
    })

    it(`sets data type`, () => {

        type GetPizzaData = CommandData<typeof getPizza>

        expectTypeOf<GetPizzaData>()
            .toEqualTypeOf<{ readonly slices: number }>()
    })

})

describe(`.result()`, () => {

    const getHighScore = Command.create(`get-high-score`)
        .result(
            $.shape({
                score: $.integer
            }).validate
        )

    it(`adds result validation`, () => {

        const result = getHighScore.validateResult({ score: 5 })
        expect(result).toEqual({ score: 5, code: 200 })

        expect(() => getHighScore.validateResult({ slices: -1.5 })).toThrow()
    })

    it(`optionally just sets result type`, () => {

        const getBuffer = Command.create(`get-buffer`)
            .result<{ buffer: number[] }>()

        expect(getBuffer.validateResult(100)).toEqual(100) // doesnt matter 

        type GetBufferOutput = CommandResult<typeof getBuffer>

        expectTypeOf<GetBufferOutput>().toEqualTypeOf<{ buffer: number[] } & CommandResultCode>()

    })

})

describe(`.req()`, () => {

    const killMosquitos = Command.create(`kill-mosquitos`)
        .data(
            $.shape({
                count: $.or($(`all`), $.integer)
                    .cast(v => v === `all` ? v : parseInt(v as string))
            }).validate
        )
        .req(
            data => [
                HttpMethod.Delete, 
                `/mosquitos/${data.count}`, 
                data
            ],
            ([method, url, data]) => {
                if (method !== HttpMethod.Delete)
                    return null 

                const count = url
                    .replace(`/mosquitos/`, ``) as 'all' | number
                
                return {
                    ...data,
                    count
                }
            }
        )

    it(`sets req callbacks`, () => {

        expect(killMosquitos.toReq({
            count: `all`
        })).toEqual([
            HttpMethod.Delete,
            `/mosquitos/all`,
            { count: `all` }
        ])

        expect(
            killMosquitos.fromReq([
                HttpMethod.Delete,
                `/mosquitos/all`,
                {} as any
            ])
        ).toEqual({ count: `all` })

        expect(
            killMosquitos.fromReq([
                HttpMethod.Delete,
                `/mosquitos/12`,
                {} as any
            ])
        ).toEqual({ count: 12 })

    })

    it(`optional easy signature`, () => {

        const backToTheFuture = Command
            .create(`time-travel`)
            .data(
                $.shape({
                    date: $.string.optional
                }).validate
            )
            .req(HttpMethod.Put, `/time`, `date`)

        expect(
            backToTheFuture.toReq({ date: `tomorrow` })
        ).toEqual([HttpMethod.Put, `/time/tomorrow`, {}])

        expect(
            backToTheFuture.fromReq([
                HttpMethod.Put,
                `/time/tomorrow`,
                {}
            ])
        ).toEqual({ date: `tomorrow` })
    
        expect(
            backToTheFuture.fromReq([
                HttpMethod.Put,
                `/time`,
                {}
            ])
        ).toEqual({ })

    })

})