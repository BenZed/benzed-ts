import { Node } from '@benzed/ecs'
import $ from '@benzed/schema'
import { nil, omit } from '@benzed/util'

import { HttpMethod } from '../../util'
import Command from './command'

it('is sealed', () => {
    // @ts-expect-error Sealed 
    void class extends Command<object> {}  
})

for (const [name, method] of Object.entries(HttpMethod)) {

    const req = Command.create(method, {})
    describe(`${Command.name}.create(${name})`, () => {
        it(`created with ${name}`, () => {
            expect(req.method)
                .toEqual(method)
        })
        it(`method ${name} in req.create() `, () => {
            expect(req.toRequest({}))
                .toHaveProperty('method', method)
        })
    })
}

describe('create methods', () => {

    it('Command.create()', () => {
        const request = Command
            .create(HttpMethod.Get, {})
            .toRequest({})
        expect(request)
            .toHaveProperty('url', '/')
    })

    it('Command.get()', () => {
        const get = Command.get({})
        expect(get.method).toEqual(HttpMethod.Get)
    })

    it('Command.post()', () => {
        const post = Command.post({})
        expect(post.method).toEqual(HttpMethod.Post)
    })

    it('Command.put()', () => {
        const put = Command.put({})
        expect(put.method).toEqual(HttpMethod.Put)
    })

    it('Command.patch()', () => {
        const patch = Command.patch({})
        expect(patch.method).toEqual(HttpMethod.Patch)
    })

    it('Command.delete()', () => {
        const del = Command.delete({})
        expect(del.method).toEqual(HttpMethod.Delete)
    })

})

describe('req.setUrl()', () => {

    const req = Command
        .create(HttpMethod.Get, {})
        .setUrl('/target') 

    it('url with string', () => {

        expect(
            req.toRequest({}))
            .toEqual({
                method: HttpMethod.Get,
                url: '/target',
                headers: nil,
                body: nil
            })

    })

    describe('url`/with/${"params"}`', () => {

        it('params are typesafe', () => {

            Command.create(HttpMethod.Delete, { ace: $.string })
                .setUrl`/orphans/${'ace'}`

            // @ts-expect-error 'bar' not in input
            Command.create(HttpMethod.Delete, { foo: $.string }).setUrl`/orphans/${'bar'}`

            // @ts-expect-error string/number's no objects or bools
            Command.create(HttpMethod.Post, { base: $.boolean }).setUrl`/orphans/${'base'}`

            Command.create(HttpMethod.Get, { case: $.string.optional })
                .setUrl`/orphans/${'case'}` // optional properties are also ok
        })

        it('url param', () => {
            const req = Command
                .create(HttpMethod.Get, { id: $.string })
                .setUrl`/target/${'id'}`

            const { url, body, method } = req.toRequest({ id: 'hello' })
            expect(method).toBe(HttpMethod.Get)
            expect(body).toBeUndefined()
            expect(url).toEqual('/target/hello')
        })

        const $query = $({ name: $.string.optional, size: $.string.optional })

        const req = Command
            .create(HttpMethod.Get, { id: $.string.optional, age: $.number.optional, query: $query.optional })
            .setQueryKey('query')
            .setUrl`/clothing-by-age/${'age'}/${'id'}`

        it('2 url param', () => {
            expect(
                req.toRequest({ id: 'shirts', age: 34, query: nil })
            ).toEqual({
                method: HttpMethod.Get,
                body: nil,
                url: '/clothing-by-age/34/shirts'
            })
        })

        it('1 url & query param', () => {
            expect(
                req.toRequest({ id: 'shirts', age: nil, query: { name: 'joe' } })
            ).toEqual({
                method: HttpMethod.Get,
                body: nil,
                url: '/clothing-by-age/shirts?name=joe'
            })
        })

        it('2 url and 2 query param', () => {
            expect(
                req.toRequest({ id: 'shirts', query: { name: 'acer', size: 'large' }, age: 30 })
            ).toEqual({
                method: HttpMethod.Get,
                body: nil,
                url: '/clothing-by-age/30/shirts?name=acer&size=large'
            })
        })

        it('2 query param', () => {
            expect(
                req.toRequest({ id: nil, age: nil, query: { name: 'hey', size: 'large' } })
            ).toEqual({
                method: HttpMethod.Get,
                body: nil,
                url: '/clothing-by-age?name=hey&size=large'
            })
        })

        it('method is preserved', () => {
            expect(

                Command.create(HttpMethod.Options, {})
                    .setUrl`/cake`
                    .method

            ).toBe(HttpMethod.Options)
        })
    })

    describe('url with pather function', () => {
        it('allows custom pathing', () => {
            const req = Command
                .create(HttpMethod.Get, { id: $.string, query: $.object.optional })
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

            expect(req.toRequest({ id: 'monkey ', query: nil })).toEqual({
                method: HttpMethod.Get,
                url: '/users/monkey'
            })

            expect(req.toRequest({ id: '1293', query: { hello: 'darkness', my: 'old', friend: true }})).toEqual({
                method: HttpMethod.Get,
                url: '/users/1293?friend=true&hello=darkness&my=old'
            })

            expect(req.setMethod(HttpMethod.Delete).toRequest({ id: 'cheese', query: { front: 'bottoms', price: 100 }})).toEqual({
                method: HttpMethod.Delete,
                body: {},
                url: '/users/cheese?front=bottoms&price=100'
            })

            expect(req.setMethod(HttpMethod.Post).toRequest({ id: 'admin', query: { cake: 1, tare: true, soke: 'cimm' }})).toEqual({
                method: HttpMethod.Post,
                body: {},
                url: '/admin-portal?cake=1&soke=cimm&tare=true'
            }) 
        })
    })
})

describe('req.setMethod()', () => {

    it('returns a new request handler with a different method', () => {
        const req = Command.create(HttpMethod.Get, {})
        expect(req.method).toEqual(HttpMethod.Get)
        expect(req.setMethod(HttpMethod.Options).method).toEqual(HttpMethod.Options)
    })

    it('pather is preserved', () => {
        const req = Command.create(HttpMethod.Get, {})
            .setUrl('/cake')
            .setMethod(HttpMethod.Patch)
            .toRequest({})
        expect(req.url).toEqual('/cake')
    })
})

describe('req.linkHeaders()', () => {

    const req = Command.create(HttpMethod.Post, { accessToken: $.string.optional })
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

        const output = req.matchRequest({
            method: HttpMethod.Post,
            url: '/authenticate',
            headers: headersWithToken()
        })

        expect(output).toEqual({ accessToken: 'token' })
    })

    it('doesn\'t match requests with headers missing', () => {
        const output = req.matchRequest({
            method: HttpMethod.Post,
            url: '/authenticate'
        })
        expect(output).toBe(nil)
    })

    it('creates requests with headers', () => {

        const { body, headers } = req.toRequest({ accessToken: 'token'})
       
        expect(body).toEqual({}) 

        const accessToken = headers?.get('authorization')
        expect(accessToken).toEqual('Bearer: token')
    })

    it('headers are not created with invalid values', () => {

        // @ts-expect-error Invalid data
        const { body, headers } = req.toRequest({ })
       
        expect(body).toEqual({})
        expect(headers).toEqual(nil)
    })
})

describe('req.match()', () => {

    const getTodo = Command.get({ id: $.string.optional })
        .setUrl`/todos/${'id'}`

    it('returns data in positive matches', () => {

        expect(
            getTodo.matchRequest({
                method: HttpMethod.Get,
                url: '/todos/1',
            })
        ).toEqual({ id: '1' })

        expect(
            getTodo.matchRequest({
                method: HttpMethod.Get,
                url: '/todos',
            })
        ).toEqual({ id: nil })
    })

    it('returns nil on negative matches', () => {
        expect(getTodo.matchRequest({ method: HttpMethod.Post, url: '/todos/100' })).toEqual(nil)
        expect(getTodo.matchRequest({ method: HttpMethod.Get, url: '/users/100' })).toEqual(nil)
        expect(getTodo.matchRequest({ method: HttpMethod.Get, url: '/todo' })).toEqual(nil)
    })

    describe('with schema', () => {

        const $employeeData = $({ email: $.string, name: $.string, age: $.number.range('>=', 18), department: $.string })

        const $employee = $({
            id: $.string,
            ...$employeeData.$,
        })

        const createEmployee = Command
            .create(HttpMethod.Post, $employeeData)
            .setUrl`/user/${'department'}`

        const updateEmployee = Command
            .create(HttpMethod.Put, $employee)
            .setUrl`/user/${'department'}/${'id'}`

        it('uses schema to ensure match valid', () => {

            const employeeData = createEmployee.matchRequest({
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

                updateEmployee.matchRequest({
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

                updateEmployee.matchRequest({
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

                createEmployee.matchRequest({
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

                createEmployee.matchRequest({
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

        const findGangster = Command.create(
            HttpMethod.Get, 
            $({
                gang: $.string,
                query: $({
                    name: $.string.optional,
                    members: $.number.optional
                }).optional
            })
        ).setUrl`/gang/${'gang'}`

        const data = findGangster.matchRequest({
            method: HttpMethod.Get,
            url: '/gang/crips?name=joe&members=1'
        })

        expect(data).toEqual({
            gang: 'crips',
            query: { name: 'joe', members: 1 }
        })
    })
})

describe('.appendHook()', () => {

    it('append a hook method, changing the command output', () => {

        const getRecord = Command
            .get({ id: $.string })
            .appendHook(data => ({ ...data, found: true }))
            .appendHook(data => ({ ...data, timestamp: new Date() }))
            .appendHook(omit('id'))

        const record = getRecord({ id: '0' }, {})
        expect(record).toEqual({ 
            found: true, 
            timestamp: expect.any(Date) 
        })
    })
})

describe('validation', () => {

    it('must not be on a node with other commands', () => {
        expect(() => Node.create(
            Command.get({}),
            Command.post({})
        )).toThrow('cannot be placed with other Command modules')
    })

    it('May not be nested', () => {
        expect(() => 
            Node.create()
        )
    })

})

test('name', () => {

    const Get = Command.get({ id: $.string }, d => ({ ...d, record: true }))

    const node = Node.create({
        get: Node.create(Get)
    })

    const get = node.assertModule.inDescendents(Get)
    expect(get.name).toEqual('get')
    expect(get.node.getPathFromRoot()).toEqual('get') 

})

it('copy', () => {

    const node = Node.create(Command.get({}))

    expect(node.module(0).node).toBe(node)

})