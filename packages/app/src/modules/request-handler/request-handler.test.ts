import $ from '@benzed/schema'
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
            expect(req.method)
                .toEqual(method)
        })
        it(`method ${name} in req.create() `, () => {
            expect(req.fromData({}))
                .toHaveProperty('method', method)
        })
    })  
}

describe('RequestHandler.create()', () => {

    it('path in req.create()', () => {
        const request = Req
            .create(HttpMethod.Get)
            .fromData({})

        expect(request)
            .toHaveProperty('url', '/')
    })

})

describe('req.setUrl()', () => {

    const req = Req
        .create(HttpMethod.Get)
        .setUrl('/target') 

    it('url with string', () => {

        expect(
            req.fromData({}))
            .toEqual({
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

            const { url, body, method } = req.fromData({ id: 'hello' })
            expect(method).toBe(HttpMethod.Get)
            expect(body).toBeUndefined()
            expect(url).toEqual('/target/hello')
        })

        const req = Req
            .create<{ id?: string, age?: number, query?: { name?: string, size?: string } }>(HttpMethod.Get)
            .setQueryKey('query')
            .setUrl`/clothing-by-age/${'age'}/${'id'}`

        it('2 url param', () => {
            expect(
                req.fromData({ id: 'shirts', age: 34 })
            ).toEqual({
                method: HttpMethod.Get,
                body: undefined,
                url: '/clothing-by-age/34/shirts'
            })
        })

        it('1 url & query param', () => {
            expect(
                req.fromData({ id: 'shirts', query: { name: 'joe' } })
            ).toEqual({
                method: HttpMethod.Get,
                body: undefined,
                url: '/clothing-by-age/shirts?name=joe'
            })
        })

        it('2 url and 2 query param', () => {
            expect(
                req.fromData({ id: 'shirts', query: { name: 'acer', size: 'large' }, age: 30 })
            ).toEqual({
                method: HttpMethod.Get,
                body: undefined,
                url: '/clothing-by-age/30/shirts?name=acer&size=large'
            })
        })

        it('2 query param', () => {
            expect(
                req.fromData({ query: { name: 'hey', size: 'large' } })
            ).toEqual({
                method: HttpMethod.Get,
                body: undefined,
                url: '/clothing-by-age?name=hey&size=large'
            })
        })

        it('method is preserved', () => {
            expect(

                Req.create(HttpMethod.Options)
                    .setUrl`/cake`
                    .method

            ).toBe(HttpMethod.Options)
        })
    })

    describe('url with pather function', () => {
        it('allows custom pathing', () => {
            const req = Req
                .create<{ id: string, query?: object }>(HttpMethod.Get)
                .setQueryKey('query')
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

            expect(req.fromData({ id: 'monkey '})).toEqual({
                method: HttpMethod.Get,
                url: '/users/monkey'
            })

            expect(req.fromData({ id: '1293', query: { hello: 'darkness', my: 'old', friend: true }})).toEqual({
                method: HttpMethod.Get,
                url: '/users/1293?friend=true&hello=darkness&my=old'
            })

            expect(req.setMethod(HttpMethod.Delete).fromData({ id: 'cheese', query: { front: 'bottoms', price: 100 }})).toEqual({
                method: HttpMethod.Delete,
                body: {},
                url: '/users/cheese?front=bottoms&price=100'
            })

            expect(req.setMethod(HttpMethod.Post).fromData({ id: 'admin', query: { cake: 1, tare: true, soke: 'cimm' }})).toEqual({
                method: HttpMethod.Post,
                body: {},
                url: '/admin-portal?cake=1&soke=cimm&tare=true'
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
            .fromData({})
        expect(req.url).toEqual('/cake')
    })
})

describe('req.linkHeaders()', () => {

    const request = Req.create<{ accessToken: string }>(HttpMethod.Post)
        .setUrl`/authenticate`
        .setHeaderLink(
            (headers, data) => {

                const { accessToken, ...rest } = data
                if (accessToken)
                    headers.set('authorization', `Bearer: ${accessToken}`)

                return rest
            },
            (headers, data) => {

                const accessToken = headers.get('authorization') ?? nil
                return accessToken 
                    ? {
                        ...data,
                        accessToken: accessToken.replace('Bearer: ', '')
                    }
                    : nil
            }
        ) 

    const headersWithToken = (): Headers => {
        const headers = new Headers()
        headers.set('authorization', 'Bearer: token')
        return headers
    }

    it('matches requests with correct headers', () => {

        const output = request.match({
            method: HttpMethod.Post,
            url: '/authenticate',
            headers: headersWithToken()
        })

        expect(output).toEqual({ accessToken: 'token' })
    })

    it('doesn\'t match requests with headers missing', () => {
        const output = request.match({
            method: HttpMethod.Post,
            url: '/authenticate'
        })
        expect(output).toBe(nil)
    })

    it('creates requests with headers', () => {

        const { body, headers } = request.fromData({ accessToken: 'token'})
       
        expect(body).toEqual({})

        const accessToken = headers?.get('authorization')
        expect(accessToken).toEqual('Bearer: token')
    })

    it('headers are not created with invalid values', () => {

        const { body, headers } = request.fromData({ })
       
        expect(body).toEqual({})
        expect(headers).toEqual(nil)
    })
})

describe('req.match()', () => {

    const getTodo = Req.create<{ id: string }>(HttpMethod.Get)
        .setUrl`/todos/${'id'}`

    it('returns data in positive matches', () => {

        expect(
            getTodo.match({
                method: HttpMethod.Get,
                url: '/todos/1',
            })
        ).toEqual({ id: '1' })

        expect(
            getTodo.match({
                method: HttpMethod.Get,
                url: '/todos',
            })
        ).toEqual({ id: undefined })
    })

    it('returns nil on negative matches', () => {
        expect(getTodo.match({ method: HttpMethod.Post, url: '/todos/100' })).toEqual(nil)
        expect(getTodo.match({ method: HttpMethod.Get, url: '/users/100' })).toEqual(nil)
        expect(getTodo.match({ method: HttpMethod.Get, url: '/todo' })).toEqual(nil)
    })

    describe('with schema', () => {

        const $employeeData = $({ email: $.string, name: $.string, age: $.number.range('>=', 18), department: $.string })

        const $employee = $({
            id: $.string,
            ...$employeeData.$,
        })

        const createEmployee = Req
            .create(HttpMethod.Post, $employeeData)
            .setUrl`/user/${'department'}`

        const updateEmployee = Req
            .create(HttpMethod.Put, $employee)
            .setUrl`/user/${'department'}/${'id'}`

        it('uses schema to ensure match valid', () => {

            const employeeData = createEmployee.match({
                method: HttpMethod.Post,
                url: '/user/art',
                body: {
                    email: 'person@email.com',
                    name: 'John Person',
                    age: 20
                }
            })

            expect(employeeData).toEqual({
                department: 'art',
                email: 'person@email.com',
                name: 'John Person',
                age: 20
            })
        })

        it('allows requests with missing url parameters to be non-matched', () => {
            expect(

                updateEmployee.match({
                    method: HttpMethod.Put,
                    url: '/user/admin',
                    body: {
                        age: 21,
                        name: 'Ace Man',
                        email: 'ace@admin.com'
                    }
                })

            ).toEqual(nil)

            expect(

                updateEmployee.match({
                    method: HttpMethod.Put,
                    url: '/user/admin/ace',
                    body: {
                        age: 21,
                        name: 'Ace Man',
                        email: 'ace@admin.com'
                    }
                })

            ).toEqual({

                id: 'ace',
                age: 21,
                name: 'Ace Man',
                email: 'ace@admin.com',
                department: 'admin'

            })

            expect(

                createEmployee.match({
                    method: HttpMethod.Post,
                    url: '/user',
                    body: {
                        age: 21,
                        name: 'Ace Man',
                        email: 'ace@admin.com'
                    }
                })

            ).toEqual(nil)
        })

        it('does not throw validation errors, rather a nil non match', () => {
            expect(

                createEmployee.match({
                    method: HttpMethod.Post,
                    url: '/user/film',
                    body: {
                        email: 'carey@film.com',
                        age: 15, // Too young! No match.
                        name: 'Carey Carey'
                    }
                })

            ).toEqual(nil)
        })
    })

    it('handles queries', () => {

        const findGangster = Req.create(
            HttpMethod.Get, 
            $({
                gang: $.string,
                query: $({
                    name: $.string.optional,
                    members: $.number.optional
                }).optional
            })
        ).setUrl`/gang/${'gang'}`

        const data = findGangster.match({
            method: HttpMethod.Get,
            url: '/gang/crips?name=joe&members=1'
        })

        expect(data).toEqual({
            gang: 'crips',
            query: { name: 'joe', members: 1 }
        })
    })
})