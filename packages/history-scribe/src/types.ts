
export interface HistoryMeta<I = string> {
    timestamp: number
    signature: I | null
}

export enum HistoryMethods {
    Create = 'create',
    Update = 'patch',
    Remove = 'remove'
}

export type HistoryMethod<T> = {
    method: HistoryMethods.Create
    data: T
} | {
    method: HistoryMethods.Update
    data: Partial<T>
} | {
    method: HistoryMethods.Remove
}

export type HistoryEntry<T, I = string> =
    HistoryMeta<I> & HistoryMethod<T>

export type Historical<T, I = string> = {
    history: HistoryEntry<T, I>[]
}

export type HistoryScribeOptions<T> = {

    /**
     * Number of milliseconds by which multiple updates from the same signature will
     * be collapsed into a single update.
     * 
     * Defaults to 0, which disables collapsing.
     */
    collapseInterval?: number

    /**
     * Updates that include data with these keys will be considered important and will
     * not collapse. 
     */
    collapseMask?: readonly (keyof T)[]
}

export type HistoryScribeInput<T extends object, I> =
    ({ data?: T } | { history?: HistoryEntry<T, I>[] })