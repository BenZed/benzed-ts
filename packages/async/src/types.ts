
export type ToAsync<T> = T extends Promise<infer Tx> 
    ? ToAsync<Tx> 
    : Promise<T>

export type ToPromise<T> = ToAsync<T>

export type FromAsync<T> = T extends Promise<infer Tx> 
    ? FromAsync<Tx> 
    : T

export type FromPromise<T> = FromAsync<T>
