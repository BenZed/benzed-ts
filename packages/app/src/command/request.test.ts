import { HttpMethod } from '../modules/connection/server/http-methods'
import { createNameToReq, createNameFromReq, ToRequest, FromRequest } from './request'
import is from '@benzed/is'
import { COMMAND_ENDPOINT } from '../constants'

/*** Helper ***/

const prettyObj = (obj: object): string => `{${Object.keys(obj).toString().trim()}}`

/*** Test ***/

describe(`createNameToReq`, () => {

    describe(`creates request data from name and data`, () => {

        for (const { name, data, request } of [
            { 
                name: `get-user`, 
                data: {}, 
                request: [`GET`, `/user`, {}] 
            },
            { 
                name: `get-todos`, 
                data: { id: 1234 }, 
                request: [`GET`, `/todos/1234`, {}] 
            },
            { 
                name: `find`, 
                data: { id: `important-thing.txt` }, 
                request: [`GET`, `/important-thing.txt`, {}] 
            },
            { 
                name: `create-new-user`, 
                data: { name: `jimmy` }, 
                request: [`POST`, `/new-user`, { name: `jimmy` }] 
            },
            {
                name: `post-bail`,
                data: { amount: 1000 },
                request: [`POST`, `/bail`, { amount: 1000 }] 
            },
            {
                name: `put-cart`,
                data: { },
                request: [`PUT`, `/cart`, { }] 
            },
            {
                name: `update-sun-shine`,
                data: { id: 1000 },
                request: [`PUT`, `/sun-shine/1000`, { }] 
            },
            {
                name: `edit-tire`,
                data: { id: `front-left` },
                request: [`PATCH`, `/tire/front-left`, { }] 
            },
            {
                name: `edit-gang`,
                data: { members: 5 },
                request: [`PATCH`, `/gang`, { members: 5 }] 
            },
            {
                name: `delete`,
                data: { id: 1 },
                request: [`DELETE`, `/1`, { }] 
            },
            {
                name: `remove-all`,
                data: { },
                request: [`DELETE`, `/all`, { }] 
            },
            {
                name: `disconnect-users`,
                data: { type: `all` },
                request: [`POST`, COMMAND_ENDPOINT, { type: `all` }] 
            }
        ] as const) {
            
            const prettyReq = `${request[0]} ${request[1]}, ${prettyObj(request[2])}`

            it(`${name} ${prettyObj(data)} -> ${prettyReq}`, () => {

                expect(
                    createNameToReq(name)(data)
                ).toEqual(request)
            })
        }
    })
})

describe(`createNameFromReq`, () => {

    describe(`converts a req-url to command data`, () => {

        for (const { request, name, data } of [
            { 
                name: `get-user`,
                data: { },
                request: [ HttpMethod.Get, `/user`, { }]
            },
            { 
                name: `find`,
                data: { },
                request: [ HttpMethod.Get, `/`, { } ]
            },
            { 
                name: `create`,
                data: { id: `1` },
                request: [ HttpMethod.Post, `/1`, { } ]
            },
            { 
                name: `post-bail`,
                data: { amount: 1000 },
                request: [ HttpMethod.Post, `/bail`, { amount: 1000 } ]
            },
            { 
                name: `put-cat`,
                data: null,
                request: [ HttpMethod.Post, `/feline/1`, { } ]
            },
            { 
                name: `disconnect-users`,
                data: { type: `all` },
                request: [ HttpMethod.Post, COMMAND_ENDPOINT, { type: `all` } ]
            },
        ] as const) {

            const prettyReq = `${request[0]} ${request[1]}, ${prettyObj(request[2])}`

            it(`${prettyReq} -> ${name} ${prettyObj(data ?? {})} ${data ? `MATCH` : `NOMATCH`}`, () => {
                expect(
                    createNameFromReq(name)(request)
                ).toEqual(data)
            })
        }
    })
})

it(`custom toReq`, () => {

    const toReq: ToRequest<{ foo: string, bar: string, money: number }, 'foo' | 'bar'> = 
    ({ foo, bar, money }) => 
        [
            HttpMethod.Patch, 
            `/foo/${foo}/${bar}`, 
            { money }
        ]

    const req = toReq({ foo: `hello`, bar: `world`, money: 1000 })

    expect(req).toEqual([HttpMethod.Patch, `/foo/hello/world`, { money: 1000 }])

})

it(`custom fromReq`, () => {
    
    const reqToAceData: FromRequest<{ ace: string, base: number }, 'ace'> = 
        ([method, url, data]) => {

            if (
                method === HttpMethod.Get && 
                url.startsWith(`/ace`) && 
                is.object<{base?: number}>(data) && 
                is.number(data.base)
            ) {
                const { base } = data
                const ace = url.replace(/\/ace\/?/, ``)
                return { ace, base }
            }
                
            return null
        }

    expect(
        reqToAceData([ HttpMethod.Get, `/ace/100`, { base: 100 } ])
    ).toEqual({ ace: `100`, base: 100 })

    expect(
        reqToAceData([ HttpMethod.Delete, `/monkey`, { count: `all` }])
    ).toEqual(null)

})