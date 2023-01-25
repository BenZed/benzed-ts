import { Infer } from '@benzed/util'

export type Async<T> = Promise<T>

export type FromAsync<T> = Infer<Awaited<T>>

export type ToAsync<T> = Infer<Async<Awaited<T>>>

export const toAsync: <T>(input: T) => ToAsync<T> = i => Promise.resolve(i)

export type FromPromise<T> = FromAsync<T>
export type ToPromise<T> = ToAsync<T>
export const toPromise = toAsync
