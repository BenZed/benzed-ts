
export type Async<T> = Promise<T>

export type FromAsync<T> = Awaited<T>
export type ToAsync<T> = Async<Awaited<T>>
export const toAsync: <T>(input: T) => ToAsync<T> = i => Promise.resolve(i)

export type FromPromise<T> = FromAsync<T>
export type ToPromise<T> = ToAsync<T>
export const toPromise = toAsync
