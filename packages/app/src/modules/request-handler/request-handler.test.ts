import { nil } from '@benzed/util'
import { HttpMethod } from '../../util'
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
        const request = Req
            .create(HttpMethod.Get)
            .toRequest({})
        
        expect(request).toHaveProperty('url', '/')
    })
})

describe('req.setUrl()', () => {

    const req = Req
        .create(HttpMethod.Get)
        .setUrl('/target')

    it('url with string', () => {
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
                .setUrl`/orphans/${'ace'}`

            // @ts-expect-error 'bar' not in object
            Req.create<{ foo: string }>(HttpMethod.Delete)
                .setUrl`/orphans/${'bar'}`

            // @ts-expect-error string/number's no objects or bools
            Req.create<{ base: boolean }>(HttpMethod.Post)
                .setUrl`/orphans/${'base'}`

            Req.create<{ case?: number }>(HttpMethod.Get)
                .setUrl`/orphans/${'case'}` // optional properties are also ok
        })

        it('url param', () => {
            const req = Req
                .create<{ id: string }>(HttpMethod.Get)
                .setUrl`/target/${'id'}`

            const { url, body, method } = req.toRequest({ id: 'hello' })

            expect(method).toBe(HttpMethod.Get)
            expect(body).toBeUndefined()
            expect(url).toEqual('/target/hello')
        })

        const req = Req
            .create<{ id?: string, name?: string, size?: string, age?: number }>(HttpMethod.Get)
            .setUrl`/clothing-by-age/${'age'}/${'id'}`

        it('2 url param', () => {
            expect(
                req.toRequest({ id: 'shirts', age: 34 })
            ).toEqual({
                method: HttpMethod.Get,
                body: undefined,
                url: '/clothing-by-age/34/shirts'
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

        it('2 url and 2 query param', () => {
            expect(
                req.toRequest({ id: 'shirts', name: 'acer', size: 'large', age: 30 })
            ).toEqual({
                method: HttpMethod.Get,
                body: undefined,
                url: '/clothing-by-age/30/shirts?name=acer&size=large'
            })
        })

        it('2 query param', () => {
            expect(
                req.toRequest({ name: 'hey', size: 'large' })
            ).toEqual({
                method: HttpMethod.Get,
                body: undefined,
                url: '/clothing-by-age?name=hey&size=large'
            })
        })

        it('method is preserved', () => {
            expect(Req
                .create(HttpMethod.Options)
                .setUrl`/cake`
                .method
            ).toBe(HttpMethod.Options)
        })
    })

    describe('url with pather function', () => {
        it('allows custom pathing', () => {
            const req = Req
                .create<{ id: string, [key:string]: number | boolean | string }>(HttpMethod.Get)
                .setUrl(
                    data => {
                        const { id, ...rest } = data

                        return [
                            id === 'admin'
                                ? '/admin-portal'
                                : `/users/${id}`, rest 
                        ]
                    }, 
                    (url, data) => {
                        if (url === '/admin-portal')
                            return { ...data, id: 'admin' }
                        else if (url.startsWith('/users/'))
                            return { ...data, id: url.replace('/users/', '')}
                        return nil
                    })

            expect(req.toRequest({ id: 'monkey '})).toEqual({
                method: HttpMethod.Get,
                url: '/users/monkey'
            })

            expect(req.toRequest({ id: 'cheese', front: 'bottoms', price: 100 })).toEqual({
                method: HttpMethod.Get,
                url: '/users/cheese?front=bottoms&price=100'
            })

            expect(req.toRequest({ id: 'admin', cake: 1, tare: true, soke: 'cimm' })).toEqual({
                method: HttpMethod.Get,
                url: '/admin-portal?cake=1&tare=true&soke=cimm'
            })
        })
    })
})

describe('req.setMethod()', () => {

    it('returns a new request handler with a different method', () => {
        const req = Req.create(HttpMethod.Get)

        expect(req.method).toEqual(HttpMethod.Get)
        expect(req.setMethod(HttpMethod.Options).method).toEqual(HttpMethod.Options)
    })

    it('pather is preserved', () => {
        const req = Req.create(HttpMethod.Get)
            .setUrl('/cake')
            .setMethod(HttpMethod.Patch)
            .toRequest({})

        expect(req.url).toEqual('/cake')
    })

})

describe('req.addHeaders()', () => {
    it.todo('adds headers to created request')
})