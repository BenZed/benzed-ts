import { floor } from '@benzed/math'
import { EventEmitter, EventListener } from '@benzed/util'
import { milliseconds } from './milliseconds'

/*** Main ***/

const $$internal = Symbol('queue-internal-listener')

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
 * Events that either a Queue or a QueueItem will emit.
 */
type QueueEvents<T> = {
    start: [QueuePayload<T>]
    complete: [T, QueuePayload<T>]
    error: [Error, QueuePayload<T>]
}

type QueueInternalListener<T, K extends keyof QueueEvents<T>> =
    EventListener<QueueEvents<T>, K> & { [$$internal]: true }

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

/*** QueueEventEmitter ***/

/**
 * Intermediate class for creating Event Emitters with internal listeners that cannot
 * be removed by public removeListener or removeAllListener methods.
 * 
 * TODO: Maybe this functionality should be on the base EventEmitter?
 */
class QueueEventEmitter<T> extends EventEmitter<QueueEvents<T>> {

    protected _addInternalListener<K extends keyof QueueEvents<T>>(
        event: K,
        listener: EventListener<QueueEvents<T>, K>,
        persist: boolean
    ): void {

        (listener as QueueInternalListener<T, K>)[$$internal] = true

        this._addListener(event, listener, persist, false)
    }

    private _isInternalListener<K extends keyof QueueEvents<T>>(
        listener: EventListener<QueueEvents<T>, K>,
    ): listener is QueueInternalListener<T, K> {
        return !!(listener as QueueInternalListener<T, K>)[$$internal]
    }

    public override removeListener<K extends keyof QueueEvents<T>>(
        event: K,
        listener: EventListener<QueueEvents<T>, K>
    ): void {

        if (this._isInternalListener(listener))
            return

        super._removeListener(event, listener)
    }

}

/*** QueueItem ***/

class QueueItem<T> extends QueueEventEmitter<T> {

    public constructor (
        public readonly task: QueueTask<T>,
        maxListeners: number
    ) {
        super(maxListeners)

        this._addInternalListener('start', () => {
            this._isStarted = true
        }, false)

        this._addInternalListener('complete', value => {
            this._value = value
            this._isFinished = true
        }, false)

        this._addInternalListener('error', error => {
            this._error = error
            this._isFinished = true
        }, false)
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

            this._addInternalListener('error', reject, false)
            this._addInternalListener('complete', resolve, false)
        })
    }

}

/*** Queue ***/

class Queue<T> extends QueueEventEmitter<T> {

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
     * Number of items waiting to be executed.
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

    public readonly maxConcurrent: number

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
            if (this[maxOption] < 1)
                throw new Error(`options.${maxOption} must be 1 or higher.`)

            if (this[maxOption] !== floor(this[maxOption]))
                throw new Error(`options.${maxOption} must be a whole number.`)
        }

        if (!isFinite(this.maxConcurrent))
            throw new Error('options.maxConcurrent cannot be Infinite.')
        //                          ^ being infinite would kind of defeat the purpose.
    }

    /*** Main ***/

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

    public finished(): Promise<void> {
        return new Promise(resolve => {

            const onFinish = (): void => {
                if (!this.isFinished)
                    return

                this.off('complete', onFinish)
                this.off('error', onFinish)

                resolve()
            }

            this._addInternalListener('complete', onFinish, true)
            this._addInternalListener('error', onFinish, true)

            onFinish() // <- in case queue is already finished
        })
    }

    private async _updateCurrentItems(): Promise<void> {

        while (!this.isPaused && this._currentItems.length < this.maxConcurrent) {
            const item = this._items.pop()
            if (!item)
                break

            this._currentItems.push(item)
        }

        // Wait until next frame so that 'start' event handlers can be
        // registered
        await milliseconds(0)

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
            item.emit('complete', value, { item, time, queue: this })
            this.emit('complete', value, { item, time, queue: this })

        } catch (e) {
            const error = e as Error

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
    QueueTask,
}