import is from '@benzed/is'
import { $$copy } from '@benzed/immutable'
import { Schematic } from '@benzed/schema'
import { Execute, ExecuteHook } from '@benzed/ecs'
import { isEmpty, nil, KeysOf, Func, Pipe, ResolveAsyncOutput } from '@benzed/util'

import {
    createStaticPather,
    createUrlParamPather,
    Pather 
} from './pather'

import {
    createStaticPathMatcher,
    createUrlParamPathMatcher,
    PathMatcher
} from './path-matcher'

import {
    Request,
    HttpMethod,
    UrlParamKeys,
    SchemaHook,
    toSchematic,
    $path,
    path,
} from '../../util'

import {
    parse as fromQueryString,
    stringify as toQueryString
} from 'query-string'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type Headerer<I extends object> = (headers: Headers, data: Partial<I>) => Partial<I>

type HeaderMatch<I extends object> = (headers: Headers, data: Partial<I>) => Partial<I> | nil

/**
 * Keys that can be used to store/retreive query object.
 */
type QueryKey<I extends object> = keyof {
    [K in KeysOf<I> as I[K] extends object | nil ? K : never]: K
}

type CommandSettings<H extends HttpMethod, I extends object> = {
    method: H
    path: {
        to: Pather<I>
        match: PathMatcher<I>
    }
    header: {
        to: Headerer<I>[]
        match: HeaderMatch<I>[]
    }
    schema?: Schematic<I>
    queryKey?: QueryKey<I>
}

interface CommandContext {
    user?: object
}

interface CommandHook<I extends object = object, O extends object = object> extends ExecuteHook<I, O, CommandContext> {}

//// Main ////

class Command<H extends HttpMethod = HttpMethod, I extends object = object, O extends object = object> extends Execute<I, O, CommandContext> {

    static create<Hx extends HttpMethod, Ix extends object>(method: Hx, schema: SchemaHook<Ix>): Command<Hx, Ix, Ix>

    static create<Hx extends HttpMethod, Ix extends object, Ox extends object>(
        method: Hx, 
        schema: SchemaHook<Ix>, 
        hook: CommandHook<Ix, Ox>
    ): Command<Hx, Ix, Ox>

    static create(method: HttpMethod, schema: SchemaHook, hook?: CommandHook): Command {

        const schematic = toSchematic(schema)

        //                       wtf? by default we're doing a hacky check to see
        //                       if there is a query object schema on the given schema
        const queryKey = '$' in ((schematic as any)?.$?.query ?? {})
            ? 'query' as QueryKey<object>
            : nil

        const execute = hook ? Pipe.from(schematic.validate).to(hook) : Pipe.from(schematic.validate)
            
        return new Command({
            method, 
            path: {
                to: createStaticPather('/'),
                match: createStaticPathMatcher('/')
            },
            header: {
                to: [],
                match: []
            },
            schema: schematic,
            queryKey
        }, execute)
    }

    static get<Ix extends object>(schema: SchemaHook<Ix>): Command<HttpMethod.Get, Ix, Ix>
    static get<Ix extends object, Ox extends object>(schema: SchemaHook<Ix>, hook: CommandHook<Ix, Ox>): Command<HttpMethod.Get, Ix, Ox>
    static get(schema: SchemaHook, hook?: CommandHook): Command<HttpMethod.Get> {
        return this.create(HttpMethod.Get, schema, hook as CommandHook)
    }

    static post<Ix extends object>(schema: SchemaHook<Ix>): Command<HttpMethod.Post, Ix, Ix>
    static post<Ix extends object, Ox extends object>(schema: SchemaHook<Ix>, hook: CommandHook<Ix, Ox>): Command<HttpMethod.Post, Ix, Ox>
    static post(schema: SchemaHook, hook?: CommandHook): Command<HttpMethod.Post> {
        return this.create(HttpMethod.Post, schema, hook as CommandHook)
    }

    static put<Ix extends object>(schema: SchemaHook<Ix>): Command<HttpMethod.Put, Ix, Ix>
    static put<Ix extends object, Ox extends object>(schema: SchemaHook<Ix>, hook: CommandHook<Ix, Ox>): Command<HttpMethod.Put, Ix, Ox>
    static put(schema: SchemaHook, hook?: CommandHook): Command<HttpMethod.Put> {
        return this.create(HttpMethod.Put, schema, hook as CommandHook)
    }

    static patch<Ix extends object>(schema: SchemaHook<Ix>): Command<HttpMethod.Patch, Ix, Ix>
    static patch<Ix extends object, Ox extends object>(schema: SchemaHook<Ix>, hook: CommandHook<Ix, Ox>): Command<HttpMethod.Patch, Ix, Ox>
    static patch(schema: SchemaHook, hook?: CommandHook): Command<HttpMethod.Patch> {
        return this.create(HttpMethod.Patch, schema, hook as CommandHook)
    }

    static delete<Ix extends object>(schema: SchemaHook<Ix>): Command<HttpMethod.Delete, Ix, Ix>
    static delete<Ix extends object, Ox extends object>(schema: SchemaHook<Ix>, hook: CommandHook<Ix, Ox>): Command<HttpMethod.Delete, Ix, Ox>
    static delete(schema: SchemaHook, hook?: CommandHook): Command<HttpMethod.Delete> {
        return this.create(HttpMethod.Delete, schema, hook as CommandHook)
    }

    constructor(
        readonly settings: CommandSettings<H,I>,
        execute: CommandHook<I,O>
    ) { 
        super(execute)
    }

    override [$$copy](): this {
        const Constructor = this.constructor as (new (settings: object, transform: Func) => this)
        return new Constructor(this.settings, this.data)
    }

    //// Handler Implementation ////
    
    toRequest(data: I): Request {
        const { method, path, schema } = this.settings
        const [ url, dataWithoutParams ] = path.to(schema?.validate(data) ?? data)
        const [ headers, dataWithoutHeaders ] = this._addHeaders(dataWithoutParams)
        const [ query, dataWithoutQuery ] = this._resolveQuery(dataWithoutHeaders)

        return {
            method,
            body: dataWithoutQuery,
            url: $path.validate(isEmpty(query) ? url : url + '?' + toQueryString(query)),
            headers
        }
    }

    matchRequest(req: Request): I | nil {

        const { method, queryKey, path, schema, header } = this.settings
        if (method !== req.method)
            return nil

        const { headers = new Headers(), url: urlWithQuery, body = {}} = req

        const [ url, queryString ] = urlWithQuery.split('?')

        const query = queryString ? fromQueryString(queryString) : nil

        const data: object = queryKey 
            ? { [queryKey]: query, ...body } 
            : { ...query, ...body }

        const pathedData = path.match($path.validate(url), data)
        if (!pathedData)
            return nil

        const headedData = header.match.reduce<Partial<I> | nil>((data, matcher) => data && matcher(headers, data), pathedData)
        if (!headedData)
            return nil
    
        try {
            return schema?.validate(headedData) ?? headedData as I
        } catch {
            return nil
        }
    }

    //// Builder Methods ////

    /**
     * Provide a url as a tempate string, where interpolated object keys will fill in url parameters
     */
    setUrl(urlSegments: TemplateStringsArray, ...urlParamKeys: UrlParamKeys<I>[]): Command<H,I,O> 
        
    /**
     * Provide a simple static path
     */
    setUrl(path: path): Command<H,I,O> 

    /**
     * Provider pather functions for creating/parsing paths
     */
    setUrl(to: Pather<I>, match: PathMatcher<I>): Command<H,I,O> 

    setUrl(
        ...args: 
        [path] | 
        [Pather<I>, PathMatcher<I>] | 
        [TemplateStringsArray, ...UrlParamKeys<I>[]]
    ): Command<H,I,O> {

        let to: Pather<I> 
        let match: PathMatcher<I>
        if (is.function(args[0]) && is.function(args[1])) {
            to = args[0]
            match = args[1]

        } else if (is.string(args[0])) {
            to = createStaticPather(args[0])
            match = createStaticPathMatcher(args[0])

        } else {
            const [ segments, ...paramKeys ] = args as [ TemplateStringsArray, ...UrlParamKeys<I>[] ]
            to = createUrlParamPather(segments, ...paramKeys)
            match = createUrlParamPathMatcher(segments, ...paramKeys)
        }

        return new Command({
            ...this.settings,
            path: { to, match },
        }, this.data)
    }

    get method(): HttpMethod {
        return this.settings.method
    }

    get queryKey(): QueryKey<I> | nil {
        return this.settings.queryKey
    }

    /**
     * Changes the method of this command
     */
    setMethod<Hx extends HttpMethod>(method: Hx): Command<Hx,I,O> {
        return new Command<Hx, I, O>({ ...this.settings, method }, this.data)
    }

    /**
     * Sets the schema for this command
     */
    setSchema(schema: Schematic<I> | nil): Command<H,I,O> {
        return new Command({ ...this.settings, schema }, this.data)
    }

    /**
     * Adds methods that manipulate headers
     */
    addHeaderLink(to: Headerer<I>, match: HeaderMatch<I>): Command<H,I,O> {
        const { header } = this.settings
        return new Command({
            ...this.settings,
            header: {
                to: [...header.to, to],
                match: [...header.match, match]
            }
        }, this.data)
    }

    /**
     * Over writes the current header links
     */
    setHeaderLink(to: Headerer<I>, match: HeaderMatch<I>): Command<H,I,O> {
        return new Command({
            ...this.settings,
            header: {
                to: [to],
                match: [match]
            }
        }, this.data)
    }

    /**
     * Provide an object 
     */
    setQueryKey(queryKey: QueryKey<I> | nil): Command<H,I,O> {
        return new Command({
            ...this.settings,
            queryKey
        }, this.data)
    }

    // @ts-expect-error "Signatures are not compatible", but they are.
    override appendHook<Ox extends object>(hook: CommandHook<Awaited<O>, Ox>): Command<H, I, ResolveAsyncOutput<O, Ox>> {
        return super.appendHook(hook) as Command<H, I, ResolveAsyncOutput<O, Ox>>
    }

    // @ts-expect-error "Signatures are not compatible", but they are.
    override prependHook<Ix extends object>(hook: CommandHook<Ix, I>): Command<H, Ix, O> {
        return super.prependHook(hook) as Command<H, Ix, O> 
    }

    //// Helper ////
    
    private _addHeaders(inputData: I | Partial<I>): [ Headers | nil, Partial<I> ] {

        const { header: headerers } = this.settings

        const headers = new Headers()
        const outputData = headerers.to.reduce((data, to) => to(headers, data), inputData)

        // only supply headers if some have been added
        let num = 0 
        headers.forEach(() => num++)
        const outputHeaders = num === 0 ? nil : headers
        
        return [ outputHeaders, outputData ]
    }

    private _resolveQuery(data: Partial<I>): [ query: object, dataWithoutQuery: Partial<I> | nil ] {

        let query: Record<string, unknown> = {}
        let dataWithoutQuery: Partial<I> | nil = { ...data }

        const queryKey = this.settings.queryKey as keyof typeof dataWithoutQuery
        if (queryKey && queryKey in dataWithoutQuery) {
            query = dataWithoutQuery[queryKey] ?? {}
            delete dataWithoutQuery[queryKey]
        }

        if (this.settings.method === HttpMethod.Get) { 
            query = { ...query, ...dataWithoutQuery }
            dataWithoutQuery = nil
        }

        return [ query, dataWithoutQuery ]
    }
}

//// Exports ////

export default Command

export {
    Command
}