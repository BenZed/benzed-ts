
export interface HistoryMeta<I = string> {
    timestamp: number
    signature: I | null
}

export type HistoryMethod<T> = {
    method: 'create'
    data: T
} | {
    method: 'patch'
    data: Partial<T>
} | {
    method: 'remove'
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