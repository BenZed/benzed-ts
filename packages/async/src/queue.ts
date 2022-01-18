import { floor } from '@benzed/math'

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

type Task<R> = () => R | Promise<R>

interface QueueOptions {
    /**
     * Number of items the queue will run simultaenously. 
     * 
     * Defaults to 1.
     */
    maxConcurrent: number

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
    // initiallyPaused: boolean

}

interface QueueItem<T> {

    readonly task: Task<T>
    value?: T
    error?: Error

}

/*** Main ***/

class Queue<T> {

    private readonly _currentItems: QueueItem<T>[] = []
    private readonly _items: QueueItem<T>[] = []

    private readonly _options: QueueOptions

    public get maxConcurrent(): number {
        return this._options.maxConcurrent
    }

    /*** Constructor ***/

    public constructor (
        options?: Partial<QueueOptions>
    ) {
        this._options = {
            maxConcurrent: 1,
            // autoStart: true,
            ...options,
        }

        if (this._options.maxConcurrent < 1)
            throw new Error('options.maxConcurrent must be 1 or higher.')

        if (this._options.maxConcurrent !== floor(this._options.maxConcurrent))
            throw new Error('options.maxConcurrent must be a whole number.')

        if (!isFinite(this._options.maxConcurrent))
            throw new Error('options.maxConcurrent cannot be Infinite.')
        //                          ^ being infinite would kind of defeat the purpose.
    }

    /*** Main ***/

    public add(
        task: Task<T>,
    ): QueueItem<T> {

        const item = { task }

        this._items.push(item)

        void this._tryAddItemToQueue()

        return item
    }

    private async _tryAddItemToQueue(): Promise<void> {

        if (this._currentItems.length >= this.maxConcurrent)
            return

        const item = this._items.shift()
        if (!item)
            return

        this._currentItems.push(item)

        item.value = await item.task()

        const index = this._currentItems.indexOf(item)
        this._currentItems.splice(
            index,
            1
        )

        this._tryAddItemToQueue()
    }

}

/*** Export ***/

export default Queue

export {
    Queue,
    QueueItem
}