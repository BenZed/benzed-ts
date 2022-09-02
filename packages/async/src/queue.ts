import {
    isDate,
    isInstanceOf,
    isInteger,
    isFinite,
    isObject,
    isNaN
} from '@benzed/is'

import { EventEmitter } from '@benzed/util'

import untilNextTick from './until-next-tick'

/*** Types ***/

/**
 * Function that can be added to a queue as a task.
 */
type QueueTask<T> = () => T | Promise<T>

/**
 * Data that is provided to a listener on either a Queue
 * or a QueueItem
 */
type QueuePayload<T> = {
    item: QueueItem<T>
    time: Date
    queue: Queue<T>
}

/**
 * Type guard that determines weather the input is a QueuePayload
 * @param input 
 * @returns 
 */
function isQueuePayload<T>(input: unknown): input is QueuePayload<T> {
    return isObject<{ [key: string]: unknown }>(input) &&
        isInstanceOf(input.item, QueueItem) &&
        isDate(input.time) &&
        isInstanceOf(input.queue, Queue)
}

/**
 * Events that either a Queue or a QueueItem will emit.
 */
type QueueEvents<T> = {
    start: [payload: QueuePayload<T>]
    complete: T extends void | undefined
    /**/ ? [payload: QueuePayload<T>]
    /**/ : [value: T, payload: QueuePayload<T>]
    error: [error: Error, payload: QueuePayload<T>]
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

/*** QueueItem ***/

class QueueItem<T> extends EventEmitter<QueueEvents<T>> {

    public constructor (
        public readonly task: QueueTask<T>,
        maxListeners: number
    ) {
        super(maxListeners)

        this._addListener('start', () => {
            this._isStarted = true
        }, { invocations: 1, internal: true })

        this._addListener('complete', (...[arg]) => {
            const value = isQueuePayload(arg) ? undefined : arg
            this._value = value as T
            this._isFinished = true
        }, { invocations: 1, internal: true })

        this._addListener('error', error => {
            this._error = error
            this._isFinished = true
        }, { invocations: 1, internal: true })
    }

    private _value?: T
    public get value(): T | undefined {
        return this._value
    }

    private _error?: Error
    public get error(): Error | undefined {
        return this._error
    }

    private _isStarted = false
    /**
     * Has the task been started by the queue?
     */
    public get isStarted(): boolean {
        return this._isStarted
    }

    /**
     * Has the task finished?
     */
    private _isFinished = false
    public get isFinished(): boolean {
        return this._isFinished
    }

    public finished(): Promise<T> {

        return new Promise((resolve, reject) => {

            // In case item is already finished
            if (this._isFinished) {
                return this._error
                    ? reject(this._error)
                    : resolve(this._value as T)
            }

            this._addListener(
                'error',
                reject,
                { internal: true, invocations: 1 })

            this._addListener(
                'complete',
                (...[arg]) => {
                    const value = isQueuePayload<T>(arg) ? undefined : arg
                    resolve(value as T)
                },
                { internal: true, invocations: 1 })
        })
    }

}

/*** Queue ***/

class Queue<T> extends EventEmitter<QueueEvents<T>> {

    private readonly _items: QueueItem<T>[] = []

    /**
     * Items waiting to be executed.
     */
    public get items(): readonly QueueItem<T>[] {
        return [...this._items]
    }

    private readonly _currentItems: QueueItem<T>[] = []

    /**
     * Currently executing items.
     */
    public get currentItems(): readonly QueueItem<T>[] {
        return [...this._currentItems]
    }

    /**
     * 
     * Number of items waiting to be executed.
     */
    public get numItems(): number {
        return this._items.length
    }

    /**
     * 
     * Number of items currently executing.
     */
    public get numCurrentItems(): number {
        return this._currentItems.length
    }

    /**
     * Number of items currently executing and waiting
     * to be executed.
     */
    public get numTotalItems(): number {
        return this.numItems + this.numCurrentItems
    }

    /**
     * Maximum number of concurrently executing items allowed on this queue.
     */
    public readonly maxConcurrent: number

    /**
     * Maximum number of items the queue can hold.
     */
    public readonly maxTotalItems: number

    /*** Constructor ***/

    public constructor (
        options?: QueueOptions
    ) {

        super(options?.maxListeners)

        this.maxConcurrent = options?.maxConcurrent ?? 1
        this.maxTotalItems = options?.maxTotalItems ?? Infinity
        this.isPaused = options?.initiallyPaused ?? false

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

    /*** Main ***/

    /**
     * Adds a task to the queue
     * @param task 
     * @returns A queue item object containing the given task.
     */
    public add(
        task: QueueTask<T>,
    ): QueueItem<T> {

        const item = new QueueItem(task, this.maxListeners)

        if (this.numTotalItems + 1 > this.maxTotalItems)
            throw new Error(`Cannot queue more than ${this.maxTotalItems} items.`)

        this._items.unshift(item)

        void this._updateCurrentItems()

        return item
    }

    /**
     * A paused queue will not execute additional tasks, but
     * currently executing tasks will complete.
     */
    public isPaused = false

    /**
     * Pauses the Queue, if it isn't already
     */
    public pause(): void {
        this.isPaused = true
    }

    /**
     * Resumes the Queue, if it isn't already.
     */
    public resume(): void {
        this.isPaused = false
    }

    /**
     * Is the queue empty?
     */
    public get isFinished(): boolean {
        return this.numTotalItems === 0
    }

    /**
     * @returns Promise that resolves when the queue is finished.
     */
    public finished(): Promise<void> {
        return new Promise(resolve => {

            const onFinish = (): void => {
                if (!this.isFinished)
                    return

                this.off('complete', onFinish)
                this.off('error', onFinish)

                resolve()
            }

            this._addListener('complete', onFinish, { internal: true })
            this._addListener('error', onFinish, { internal: true })

            onFinish() // <- in case queue is already finished
        })
    }

    /*** Helper ***/

    private async _updateCurrentItems(): Promise<void> {

        while (!this.isPaused && this._currentItems.length < this.maxConcurrent) {
            const item = this._items.pop()
            if (!item)
                break

            this._currentItems.push(item)
        }

        // Wait until next frame so that 'start' event handlers can be
        // registered
        await untilNextTick()

        for (const item of this._currentItems) {
            if (!item.isStarted)
                void this._executeCurrentItem(item)
        }

    }

    private _removeCurrentItem(item: QueueItem<T>): void {
        const index = this._currentItems.indexOf(item)
        if (index < 0)
            throw new Error(`Item ${item} is not currently executing.`)

        this._currentItems.splice(
            index,
            1
        )
    }

    private async _executeCurrentItem(item: QueueItem<T>): Promise<void> {

        const time = new Date()

        item.emit('start', { item, time, queue: this })
        this.emit('start', { item, time, queue: this })

        try {
            const value = await item.task()

            this._removeCurrentItem(item)

            const time = new Date()
            const payload = { item, time, queue: this }

            const args = (
                value === undefined
                    ? [payload]
                    : [value, payload]
            ) as unknown as QueueEvents<T>['complete']
            //           ^ don't really understand the 
            //             unknown cast, but w/e

            item.emit('complete', ...args)
            this.emit('complete', ...args)

        } catch (e) {
            const error = e as Error

            if (this._currentItems.includes(item))
                this._removeCurrentItem(item)

            const time = new Date()
            item.emit('error', error, { item, time, queue: this })
            this.emit('error', error, { item, time, queue: this })
        }

        this._updateCurrentItems()
    }

}

/*** Export ***/

export default Queue

export {
    Queue,
    QueueItem,

    QueueOptions,

    QueuePayload,
    isQueuePayload,

    QueueTask,
}