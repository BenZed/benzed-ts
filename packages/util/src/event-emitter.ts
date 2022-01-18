
/* eslint-disable 
    @typescript-eslint/indent, 
    @typescript-eslint/no-explicit-any,
*/

/*** Constants ***/

const DEFAULT_MAX_LISTENERS = 10

/*** Types ***/

type Events = {
    [key: string]: any[]
}

type EventListener<T extends Events, K extends keyof T> =
    (...args: T[K]) => void | Promise<void>

/**
 * A type-safe event emitter.
 * 
 * NOT a drop-in replacement for the node EventEmitter, it's 
 * api differs slightly to adhere to idiomatic standards changes
 * in js.
 * 
 * Most notably, there is no default 'addListener' or 'removeListener'
 * event. Extend the class and it's addListener / removeListener methods 
 * to 
 */
class EventEmitter<T extends Events> {

    private readonly _listeners: {
        [K in keyof T]?: Array<{
            persist: boolean
            listener: EventListener<T, K>
        }>
    } = {}

    public constructor (
        private _maxListeners = DEFAULT_MAX_LISTENERS
    ) { }

    /**
     * Registers a listener function to an event. Listener will
     * be called when event is emitted. 
     * 
     * @param event Event name
     * @param listener Event function
     */
    public addListener<K extends keyof T>(
        event: K,
        listener: EventListener<T, K>
    ): void {
        this._addListener(event, listener, true, false)
    }

    /**
     * Registers a listener function to a an event.
     * Listener will be called when event is emitted, but only once. 
     * 
     * @param event Event name
     * @param listener Event listener
     */
    public addOnceListener<K extends keyof T>(
        event: K,
        listener: EventListener<T, K>
    ): void {
        this._addListener(event, listener, false, false)
    }

    /**
     * Registers a listener function to an event. Listener will
     * be called when event is emitted. 
     * 
     * @param event Event name
     * @param listener Event function
     */
    public on<K extends keyof T>(
        event: K,
        listener: EventListener<T, K>
    ): void {
        this.addListener(event, listener)
    }

    /**
     * Registers a listener function to a an event.
     * Listener will be called when event is emitted, but only once. 
     * 
     * @param event Event name
     * @param listener Event listener
     */
    public once<K extends keyof T>(
        event: K,
        listener: EventListener<T, K>
    ): void {
        this.addOnceListener(event, listener)
    }

    /**
     * Registers a listener function to an event. Listener will
     * be called when event is emitted. Listener will be called
     * before other registered listeners.
     * 
     * @param event Event name
     * @param listener Event function
     */
    public prependListener<K extends keyof T>(
        event: K,
        listener: EventListener<T, K>
    ): void {
        this._addListener(event, listener, true, true)
    }

    /**
     * Registers a listener function to a an event.
     * Listener will be called before other registered listeners, 
     * but only once.
     * 
     * @param event Event name
     * @param listener Event listener
     */
    public prependOnceListener<K extends keyof T>(
        event: K,
        listener: EventListener<T, K>
    ): void {
        this._addListener(event, listener, false, true)
    }

    /**
     * Unregisters a listener. Listener will no longer be called when
     * event is emitted.
     * 
     * @param event Event name
     * @param listener Event listener
     * @param all Removes every listener for the given event.
     */
    public removeListener<K extends keyof T>(
        event: K,
        listener: EventListener<T, K>,
    ): void {
        this._removeListener(event, listener)
    }

    /**
     * Unregisters all listeners for a given event.
     * 
     * @param event Event name
     * @param listener Event listener
     * @param all Removes every listener for the given event.
     */
    public removeAllListeners<K extends keyof T>(
        event: K,
    ): void {
        const listeners = this._listeners[event] ?? []

        for (const { listener } of [...listeners])
            this.removeListener(event, listener)
    }

    /**
     * Unregisters an event listener. Listener will no longer be called when
     * event is emitted. 
     * If the same listener is registered to the same event multiple times,
     * the last registered listener will be removed first.
     *
     * 
     * @param event Event name
     * @param listener Event listener
     * @param all Removes every listener for the given event.
     */
    public off<K extends keyof T>(
        event: K,
        listener: EventListener<T, K>,
    ): void {
        this._removeListener(event, listener)
    }

    /**
     * Call all listeners to an event with the provided arguments. 
     * 
     * @param event Event to be emitted
     * @param args Arguments to provided to event listener function.
     */
    public emit<K extends keyof T>(event: K, ...args: T[K]): void {

        const listeners = this._listeners[event] ?? []

        for (const { listener, persist } of [...listeners]) {
            //                              ^ shallow copy so that removing non-persitent
            //                                listeners doesn't cause any skipping.
            listener(...args)

            if (!persist)
                this._removeListener(event, listener)
        }
    }

    /**
     * Returns the number of listeners a given event has. 
     * 
     * @param event Event name
     * @returns Number of listeners.
     */
    public getNumListeners<K extends keyof T>(event: K): number {
        return this._listeners[event]?.length ?? 0
    }

    /**
     * A list of event names that have listeners attached.
     */
    public get eventNames(): (keyof T)[] {
        const eventNames: (keyof T)[] = []

        for (const eventName in this._listeners) {
            const listeners = this._listeners[eventName]
            if (!listeners)
                continue

            if (listeners.length > 0)
                eventNames.push(eventName)
        }

        return eventNames
    }

    /**
     * The maximum number of listeners that can be
     * added to events.
     */
    public get maxListeners(): number {
        return this._maxListeners
    }

    public set maxListeners(value: number) {
        value = Math.round(value)

        if (value <= 0)
            value = Infinity

        this._maxListeners = value
    }

    // Helper 

    protected _addListener<K extends keyof T>(
        event: K,
        listener: EventListener<T, K>,
        persist: boolean,
        prepend: boolean
    ): void {

        const listeners = this._listeners[event] ?? (this._listeners[event] = []) as {
            persist: boolean
            listener: EventListener<T, K>
        }[]

        const method = prepend ? 'unshift' : 'push'

        if (listeners.length + 1 > this.maxListeners) {
            throw new Error(
                `Cannot add more than ${this.maxListeners} ` +
                `listeners for the "${event}" event.`
            )
        }

        listeners[method]({ listener, persist })
    }

    protected _removeListener<K extends keyof T>(
        event: K,
        listener: EventListener<T, K>,
    ): void {

        const listeners = this._listeners[event]
        if (!listeners)
            return

        // const index = listeners.findLastIndexOf(item => item.listener === listener)
        let index = -1
        for (let i = listeners.length - 1; i >= 0; i--) {
            const item = listeners[i]
            if (item.listener === listener) {
                index = i
                break
            }
        }

        if (index >= 0)
            listeners.splice(index, 1)
    }

}

/*** Exports ***/

export default EventEmitter

export {
    EventEmitter,
    EventListener
}