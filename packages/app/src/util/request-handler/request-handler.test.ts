import { HttpMethod } from '..'
import { RequestHandler as Req } from './request-handler'

it('is sealed', () => {
    // @ts-expect-error Sealed
    void class extends Req<object> {}
})

for (const [name, method] of Object.entries(HttpMethod)) {
    const req = Req.create(method)

    describe(`RequestHandler.create(${name})`, () => {

        it(`created with ${name}`, () => {
            expect(req.method).toEqual(method)
        })
    
        it(`method ${name} in req.create() `, () => {
            expect(req.toRequest({})).toHaveProperty('method', method)
        })
    })

}

describe('RequestHandler.create()', () => {
    it('path in req.create()', () => {
        const request = Req.create(HttpMethod.Get).toRequest({})
        expect(request).toHaveProperty('url', '/')
    })

})

describe('RequestHandler.url()', () => {

    const req = Req
        .create(HttpMethod.Get)
        .url('/target')

    it('path in req.create()', () => {
        expect(req.toRequest({})).toEqual({
            method: HttpMethod.Get,
            url: '/target',
            headers: undefined,
            body: undefined
        })
    })

    describe('url`/with/${"params"}`', () => {

        it('params are typesafe', () => {

            Req.create<{ ace: string }>(HttpMethod.Delete)
                .url`/orphans/${'ace'}`

            Req.create<{ foo: string }>(HttpMethod.Delete)
            // @ts-expect-error 'bar' not in object
                .url`/orphans/${'bar'}`

            Req.create<{ base: boolean }>(HttpMethod.Post)
            // @ts-expect-error string/number's no objects or bools
                .url`/orphans/${'base'}`

            Req.create<{ case?: number}>(HttpMethod.Get)
                .url`/orphans/${'case'}` // optional properties are also ok
        })

        it('url param', () => {
            const req = Req
                .create<{ id: string }>(HttpMethod.Get)
                .url`/target/${'id'}`

            const { url, body, method } = req.toRequest({ id: 'hello' })

            expect(method).toBe(HttpMethod.Get)
            expect(body).toBeUndefined()
            expect(url).toEqual('/target/hello')
        })

        const req = Req
            .create<{ id: string, name?: string, age?: number }>(HttpMethod.Get)
            .url`/clothing-by-age/${'age'}${'id'}`

        it('2 url param', () => {
            expect(
                req.toRequest({ id: 'shirts', age: 34 })
            ).toEqual({
                method: HttpMethod.Get,
                body: undefined,
                url: '/clothing-by-age/34shirts'
            })
        })

        it('1 url & query param', () => {

            expect(
                req.toRequest({ id: 'shirts', name: 'joe' })
            ).toEqual({
                method: HttpMethod.Get,
                body: undefined,
                url: '/clothing-by-age/shirts?name=joe'
            })
        })

        it('2 url and query param', () => {
            expect(
                req.toRequest({ id: 'shirts', name: 'acer', age: 30 })
            ).toEqual({
                method: HttpMethod.Get,
                body: undefined,
                url: '/clothing-by-age/30shirts?name=acer'
            })
        })

    })
})