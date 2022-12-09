import { EventEmitter, isArray, isInteger, isNaN, isObject, LinkedList } from '@benzed/util'
import { first, wrap } from '@benzed/array'

import untilNextTick from './until-next-tick'

//// Types ////

/**
 * Function that can be added to a queue as a task.
 */
type QueueTask<V, T extends object | void> = T extends void
    ? () => V | Promise<V>
    : (data: T) => V | Promise<V>

/**
 * Data that is provided to a listener on either a Queue
 * or a QueueItem
 */
type QueuePayload<V, T extends object | void> = {
    item: QueueItem<V, T>
    time: Date
    queue: Queue<V, T>
}

/**
 * Type guard that determines weather the input is a QueuePayload
 * @param input 
 * @returns 
 */
function isQueuePayload<V, T extends object | void>(
    input: unknown
): input is QueuePayload<V, T> {

    return isObject<{ [key: string]: unknown }>(input) &&
        input.time instanceof Date &&
        input.queue instanceof Queue
}

/**
 * Events that either a Queue or a QueueItem will emit.
 */
type QueueEvents<V, T extends object | void> = {

    /**
     * Anytime an item in the queue starts
     */
    start: [payload: QueuePayload<V, T>]

    /**
     * Anytime an item in the queue completes a task
     */
    complete: V extends void | undefined
    /**/ ? [payload: QueuePayload<V, T>]
    /**/ : [payload: QueuePayload<V, T>, value: V]

    /**
     * Anytime an item in the queue has an error
     */
    error: [payload: QueuePayload<V, T>, error: Error]
}

interface QueueOptions {
    /**
     * Number of items the queue will run simultaenously. 
     * 
     * Defaults to 1.
     */
    maxConcurrent?: number

    /**
     * Max Queue Event Emitter listeners. 10 by default.
     */
    maxListeners?: number

    /**
     * Maximum number of items that can be in the queue. Infinite by default.
     */
    maxTotalItems?: number

    /**
     * Weather or not the queue will run tasks when they are 
     * added. 
     * 
     * Equivalent to: 
     * ```ts
     * const queue = new Queue()
     * queue.pause()
     * ```
     *
     * Defaults to false.
     */
    initiallyPaused?: boolean

}

interface QueueState<V, T extends object | void> {
    task: QueueTask<V, T>
    stage: 'queued' | 'current' | 'complete'
    error: null | Error
    result: V extends void ? null : null | { value: V }
    complete: null | Promise<V>
    data: T
}

type QueueItem<V, T extends object | void> =
    (T extends void ? { /**/ } : T) &
    {
        readonly [
        /**/ K in keyof QueueState<V, T> as K extends 'task' | 'complete'
        /*    */ ? never
        /*    */ : K
        ]: QueueState<V, T>[K]
    } & {

        get isQueued(): boolean
        get isCurrent(): boolean
        get isComplete(): boolean
        complete(): Promise<V>
    }

type QueueAddInput<V, T extends object | void> =
    T extends void ? QueueTask<V, T> : ({ task: QueueTask<V, T> } & T)

//// Queue ////

class Queue<
    V = void,
    T extends object | void = void
> extends EventEmitter<QueueEvents<V, T>> {

    private readonly _queued: LinkedList<{ item: QueueItem<V, T>, state: QueueState<V, T> }> =
        new LinkedList

    /**
     * Items waiting to be executed.
     */
    get queuedItems(): readonly QueueItem<V, T>[] {
        return Array.from(this._queued).map(q => q.value.item)
    }

    private readonly _current: LinkedList<{ item: QueueItem<V, T>, state: QueueState<V, T> }> =
        new LinkedList

    /**
     * Currently executing items.
     */
    get currentItems(): readonly QueueItem<V, T>[] {
        return Array.from(this._current).map(q => q.value.item)
    }

    /**
     * 
     * Number of items waiting to be executed.
     */
    get numQueuedItems(): number {
        return this._queued.size
    }

    /**
     * 
     * Number of items currently executing.
     */
    get numCurrentItems(): number {
        return this._current.size
    }

    /**
     * Number of items currently executing and waiting
     * to be executed.
     */
    get numTotalItems(): number {
        return this.numQueuedItems + this.numCurrentItems
    }

    /**
     * Maximum number of concurrently executing items allowed on this queue.
     */
    readonly maxConcurrent: number

    /**
     * Maximum number of items the queue can hold.
     */
    readonly maxTotalItems: number

    //// Constructor ////

    constructor (
        options?: QueueOptions
    ) {

        super(options?.maxListeners)

        this.maxConcurrent = options?.maxConcurrent ?? 1
        this.maxTotalItems = options?.maxTotalItems ?? Infinity
        this._isPaused = options?.initiallyPaused ?? false

        for (const maxOption of ['maxConcurrent', 'maxTotalItems'] as const) {
            if (this[maxOption] < 1 || isNaN(this[maxOption]))
                throw new Error(`options.${maxOption} must be 1 or higher.`)
        }

        if (!isInteger(this.maxConcurrent))
            throw new Error('options.maxConcurrent must be an integer.')

        if (
            !isInteger(this.maxTotalItems) &&
            isFinite(this.maxTotalItems)
        ) {
            throw new Error(
                'options.maxTotalItems must be infinite or an integer.'
            )
        }
    }

    //// Main ////

    /**
     * Adds multiple tasks to the queue
     * @param task 
     * @returns An array of QueueItems
     */
    add(
        task: QueueAddInput<V, T>
    ): QueueItem<V, T>

    /**
     * Adds a task to the queue
     * @param task 
     * @returns A QueueItem 
     */
    add(
        task: QueueAddInput<V, T>[],
    ): QueueItem<V, T>[]

    add(
        input: QueueAddInput<V, T> | QueueAddInput<V, T>[]
    ): unknown {

        const inputWasArray = isArray(input)

        const tasks = wrap(input) as QueueAddInput<V, T>[]

        if (this.numTotalItems + tasks.length > this.maxTotalItems)
            throw new Error(`Cannot queue more than ${this.maxTotalItems} items.`)

        const items = tasks.map(task => this._createQueuedItem(task))

        void this._updateCurrentItems()

        return inputWasArray ? items : first(items)
    }

    private _createQueuedItem(input: QueueAddInput<V, T>): QueueItem<V, T> {

        const { task, ...data } = typeof input === 'function' ? { task: input } : input

        const state: QueueState<V, T> = {
            task: task as QueueTask<V, T>,
            stage: 'queued',
            error: null,
            result: null as QueueState<V, T>['result'],
            complete: null,
            data: data as T
        }

        const item = {

            get stage() {
                return state.stage
            },

            get error() {
                return state.error
            },

            get result() {
                return state.result
            },

            get isQueued() {
                return state.stage === 'queued'
            },

            get isCurrent() {
                return state.stage === 'current'
            },

            get isComplete() {
                return state.stage === 'complete'
            },

            complete: () => {

                const promise = state.complete ??= new Promise((resolve, reject) => {

                    const onComplete = (): void => {
                        if (state.stage !== 'complete')
                            return

                        this._removeListener('complete', onComplete, { internal: true })
                        this._removeListener('error', onComplete, { internal: true })

                        if (state.error)
                            reject(state.error)
                        else
                            resolve(state.result?.value as V)
                    }

                    this._addListener('complete', onComplete, { internal: true })
                    this._addListener('error', onComplete, { internal: true })

                    onComplete()
                })

                return promise
            }

        } as QueueItem<V, T>

        if (data) {
            for (const key in data) {
                if (key in item === false) {
                    Object.defineProperty(item, key, {
                        get() {
                            return state.data[key as keyof T]
                        },
                        set(value) {
                            state.data[key as keyof T] = value
                        },
                        enumerable: true
                    })
                }
            }
        }

        this._queued.append({ item, state })

        return item
    }

    /**
     * Removes all items in the queue with a given task.
     * Returns the number of removed tasks.
     */
    remove(
        item: QueueTask<V, T> | QueueItem<V, T>
    ): number {

        const numItems = this._queued.size

        const indexes: number[] = []

        for (const [{ value: queued }, index] of this._queued.entries()) {
            if (queued.item === item || queued.state.task === item)
                indexes.push(index)
        }

        while (indexes.length > 0)
            this._queued.remove(indexes.pop())

        return numItems - this._queued.size
    }

    /**
     * Removes all items in the queue.
     * Returns the number of removed items.
     */
    clear(): number {
        const count = this._queued.size
        this._queued.clear()

        return count
    }

    /**
     * A paused queue will not execute additional tasks, but
     * currently executing tasks will complete.
     */
    get isPaused(): boolean {
        return this._isPaused
    }
    set isPaused(value: boolean) {
        if (value)
            this.resume()
        else
            this.pause()

    }
    private _isPaused: boolean

    /**
     * Pauses the Queue, if it isn't already
     */
    pause(): void {
        this._isPaused = true
    }

    /**
     * Resumes the Queue, if it isn't already.
     */
    resume(): void {
        this._isPaused = false
        this._updateCurrentItems()
    }

    /**
     * Is the queue empty?
     */
    get isComplete(): boolean {
        return this.numTotalItems === 0
    }

    /**
     * @returns Promise that resolves when the queue is finished.
     */
    complete(): Promise<void> {
        return new Promise(resolve => {

            const onComplete = (): void => {
                if (!this.isComplete)
                    return

                this._removeListener('complete', onComplete, { internal: true })
                this._removeListener('error', onComplete, { internal: true })

                resolve()
            }

            this._addListener('complete', onComplete, { internal: true })
            this._addListener('error', onComplete, { internal: true })

            onComplete() // <- in case queue is already finished
        })
    }

    //// Helper ////

    private async _updateCurrentItems(): Promise<void> {

        while (
            !this.isPaused &&
            this._current.size < this.maxConcurrent &&
            !this._queued.isEmpty
        ) {
            this._current.append(
                this._queued.remove()
            )
        }

        // Wait until next frame so that 'start' event handlers can be
        // registered
        await untilNextTick()

        for (const { value: current } of this._current) {
            if (current.item.stage === 'queued')
                void this._executeCurrentItem(current)
        }

    }

    private _removeCurrentItem(
        current: {
            item: QueueItem<V, T>
            state: QueueState<V, T>
        }
    ): void {
        const index = this._current.indexOf(current)
        if (index < 0)
            throw new Error('Item is not currently executing.')

        this._current.remove(index)
    }

    private async _executeCurrentItem(
        current: { item: QueueItem<V, T>, state: QueueState<V, T> }
    ): Promise<void> {

        const time = new Date()

        const { item, state } = current

        // item.emit('start', { item, time, queue: this })
        state.stage = 'current'
        this.emit('start', { item, time, queue: this })

        try {

            const { data, task } = state
            const value = await task(data as object)

            state.stage = 'complete'
            state.result = { value } as unknown as QueueState<V, T>['result']

            this._removeCurrentItem(current)

            const time = new Date()
            const payload = { item, time, queue: this }

            const args: unknown[] = [payload]
            if (value !== undefined)
                args.push(value)

            this.emit('complete', ...args as QueueEvents<V, T>['complete'])

        } catch (e) {

            const error = e as Error

            state.stage = 'complete'
            state.error = error

            if (this._current.has(current))
                this._removeCurrentItem(current)

            const time = new Date()
            this.emit('error', { item, time, queue: this }, error)
        }

        this._updateCurrentItems()
    }

}

//// Export ////

export default Queue

export {

    Queue,
    QueueOptions,
    QueuePayload,

    isQueuePayload,

    QueueTask,
    QueueItem
}