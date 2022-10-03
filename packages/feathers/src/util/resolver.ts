import { BadRequest } from '@feathersjs/errors'
import { SchemaFor } from '@benzed/schema'

/*
    This is straight up ripped off from 
        https://github.com/feathersjs/feathers/blob/dove/packages/schema/src/resolver.ts 

    So that I don't need to install the feathersjs/schema package, and can instead use
    @benzed/schema.

    Aside from removing some unneccessary await statements and changing some type annotations,
    it is completely unchanged.
*/

/* eslint-disable 
    @typescript-eslint/no-explicit-any, 
    @typescript-eslint/explicit-function-return-type
*/

/*** Types ***/

export type PropertyResolver<T, V, C> = (
    value: V | undefined,
    obj: T,
    context: C,
    status: ResolverStatus<T, C>
) => Promise<V | undefined>

export type PropertyResolverMap<T, C> = {
    [key in keyof T]?: PropertyResolver<T, T[key], C>
}

export type ResolverConverter<T, C> = (
    obj: any,
    context: C,
    status: ResolverStatus<T, C>
) => Promise<T | undefined>

export interface ResolverConfig<T, C> {
    schema?: SchemaFor<T>
    validate?: 'before' | 'after' | false
    properties: PropertyResolverMap<T, C>
    converter?: ResolverConverter<T, C>
}

export interface ResolverStatus<T, C> {
    path: string[]
    originalContext?: C
    properties?: string[]
    stack: PropertyResolver<T, any, C>[]
}

export class Resolver<T, C> {
    protected readonly _type!: T

    public constructor(public options: ResolverConfig<T, C>) {}

    public resolveProperty<D, K extends keyof T>(
        name: K,
        data: D,
        context: C,
        status: Partial<ResolverStatus<T, C>> = {}
    ) {
        const resolver = this.options.properties[name]
        const value = (data as any)[name]
        const { path = [], stack = [] } = status || {}

        // This prevents circular dependencies
        if (stack.includes(resolver as any)) 
            return undefined

        const resolverStatus = {
            ...status,
            path: [...path, name as string],
            stack: [...stack, resolver]
        }

        return resolver?.(value, data as any, context, resolverStatus as any)
    }

    public convert<D>(
        data: D, 
        context: C, 
        status?: Partial<ResolverStatus<T, C>>
    ) {
        if (this.options.converter) {
            const { path = [], stack = [] } = status ?? {}

            return this.options.converter(data, context, { ...status, path, stack })
        }

        return data
    }

    public async resolve<D>(
        _data: D, 
        context: C,
        status?: Partial<ResolverStatus<T, C>>
    ): Promise<T> {
        const { properties: resolvers, schema, validate } = this.options
        const payload = await this.convert(_data, context, status)
        const data = schema && validate === 'before' ? schema.validate(payload) : payload
        const propertyList = (
            Array.isArray(status?.properties)
                ? status?.properties
                : // By default get all data and resolver keys but remove duplicates
                [...new Set(Object.keys(data as any).concat(Object.keys(resolvers)))]
        ) as (keyof T)[]

        const result: any = {}
        const errors: any = {}
        let hasErrors = false

        // Not the most elegant but better performance
        await Promise.all(
            propertyList.map(async (name) => {
                const value = (data as any)[name]

                if (resolvers[name]) {
                    try {
                        const resolved = await this.resolveProperty(name, data, context, status)

                        if (resolved !== undefined) 
                            result[name] = resolved
            
                    } catch (error: any) {
                        // TODO add error stacks
                        const convertedError = typeof error.toJSON === 'function' 
                            ? error.toJSON() 
                            : { message: error.message || error }

                        errors[name] = convertedError
                        hasErrors = true
                    }

                } else if (value !== undefined) 
                    result[name] = value
            })
        )

        if (hasErrors) {
            const propertyName = status?.properties ? ` ${status.properties.join('.')}` : ''

            throw new BadRequest(
                'Error resolving data' + 
                (propertyName ? ` ${propertyName}` : ''), errors
            )
        }

        return schema && validate === 'after' ? schema.validate(result) : result
    }
}

export function resolve<T, C>(options: ResolverConfig<T, C>): Resolver<T,C> {
    return new Resolver<T, C>(options)
}