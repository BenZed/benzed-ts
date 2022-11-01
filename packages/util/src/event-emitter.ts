
/* eslint-disable 
    @typescript-eslint/indent, 
    @typescript-eslint/no-explicit-any,
*/

import { StringKeys } from './types'

//// Constants ////

const DEFAULT_MAX_LISTENERS = 10

//// Types ////

type EventSubscription<T extends object = any, K extends StringKeys<T> = StringKeys<T>> = {

    /**
     * Number of times the listener will be called before being removed.
     */
    invocations: number

    /**
     * Internal listeners will not be removed by public remove methods.
     */
    internal: boolean

    listener: EventListener<T, K>
}

type AsArray<T> = T extends unknown[] ? T : never

type EventListener<T extends object, K extends StringKeys<T>> =
    (...args: AsArray<T[K]>) => void | Promise<void>

/**
 * A type-safe event emitter.
 * 
 * NOT a drop-in replacement for the node EventEmitter, it's 
 * api differs slightly to adhere to idiomatic standards changes
 * in js.
 * 
 * Most notably, there is no default 'addListener' or 'removeListener'
 * event. Extend the class and it's addListener / removeListener methods 
 * to gain equivalent functionality. 
 */
class EventEmitter<T extends object = any> {

    protected readonly _subscriptions: {
        [K in StringKeys<T>]?: Array<EventSubscription<T, K>>
    } = {}

    constructor (
        private _maxListeners = DEFAULT_MAX_LISTENERS
    ) { }

    /**
     * Registers a listener function to an event. Listener will
     * be called when event is emitted. 
     * 
     * @param event Event name
     * @param listener Event function
     */
    addListener<K extends StringKeys<T>>(
        event: K,
        listener: EventListener<T, K>
    ): void {
        this._addListener(event, listener, {
            invocations: Infinity,
            internal: false,
            prepend: false
        })
    }

    /**
     * Registers a listener function to a an event.
     * Listener will be called when event is emitted, but only once. 
     * 
     * @param event Event name
     * @param listener Event listener
     */
    addOnceListener<K extends StringKeys<T>>(
        event: K,
        listener: EventListener<T, K>
    ): void {
        this._addListener(event, listener, {
            invocations: 1,
            internal: false,
            prepend: false
        })
    }

    /**
     * Registers a listener function to an event. Listener will
     * be called when event is emitted. 
     * 
     * @param event Event name
     * @param listener Event function
     */
    on<K extends StringKeys<T>>(
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
    once<K extends StringKeys<T>>(
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
    prependListener<K extends StringKeys<T>>(
        event: K,
        listener: EventListener<T, K>
    ): void {
        this._addListener(event, listener, {
            invocations: Infinity,
            internal: false,
            prepend: true
        })
    }

    /**
     * Registers a listener function to a an event.
     * Listener will be called before other registered listeners, 
     * but only once.
     * 
     * @param event Event name
     * @param listener Event listener
     */
    prependOnceListener<K extends StringKeys<T>>(
        event: K,
        listener: EventListener<T, K>
    ): void {
        this._addListener(event, listener, {
            invocations: 1,
            internal: false,
            prepend: true
        })
    }

    /**
     * Unregisters a listener. Listener will no longer be called when
     * event is emitted.
     * 
     * @param event Event name
     * @param listener Event listener
     * @param all Removes every listener for the given event.
     */
    removeListener<K extends StringKeys<T>>(
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
    removeAllListeners<K extends StringKeys<T>>(
        event: K,
    ): void {
        const subscriptions = this._subscriptions[event] ?? []

        for (const { listener } of [...subscriptions])
            //                     ^ shallow copy to prevent skipping.
            this._removeListener(event, listener)
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
    off<K extends StringKeys<T>>(
        event: K,
        listener: EventListener<T, K>,
    ): void {
        this.removeListener(event, listener)
    }

    /**
     * Call all listeners to an event with the provided arguments. 
     * 
     * @param event Event to be emitted
     * @param args Arguments to provided to event listener function.
     */
    emit<K extends StringKeys<T>>(event: K, ...args: AsArray<T[K]>): void {

        const subscriptions = this._subscriptions[event] ?? []

        for (const subscription of [...subscriptions]) {
            //                     ^ shallow copy so that removing non-persistent
            //                       listeners doesn't cause any skipping.
            subscription.listener.apply(this, args)

            if (--subscription.invocations <= 0)
                this._removeListener(event, subscription.listener, { internal: true })
        }
    }

    /**
     * Returns the number of listeners a given event has. 
     * 
     * @param event Event name
     * @returns Number of listeners.
     */
    getNumListeners<K extends StringKeys<T>>(event: K): number {
        return this._getNumListeners(event)
    }

    _getNumListeners<K extends StringKeys<T>>(
        event: K,
        options?: { internal?: boolean }
    ): number {

        const { internal: includeInternal = false } = options ?? {}

        return this._subscriptions[event]
            ?.filter(sub => includeInternal || !sub.internal)
            .length ?? 0
    }

    /**
     * A list of event names that have listeners attached.
     */
    get eventNames(): (StringKeys<T>)[] {
        return this._getEventNames()
    }

    /**
     * Gets a list of even names that have listeneres attached, optionally able
     * to include internal events.
     */
    protected _getEventNames(options?: { internal?: boolean }): (StringKeys<T>)[] {

        const { internal: includeInternal = false } = options ?? {}

        const eventNames: (StringKeys<T>)[] = []

        for (const key in this._subscriptions) {

            const eventName = key as StringKeys<T>
            const subscriptions = this._subscriptions[eventName]
            if (!subscriptions)
                continue

            if (
                subscriptions.length > 0 &&
                includeInternal || !subscriptions.every(sub => sub.internal)
            )
                eventNames.push(eventName)
        }

        return eventNames

    }

    /**
     * The maximum number of listeners that can be
     * added to events.
     */
    get maxListeners(): number {
        return this._maxListeners
    }

    set maxListeners(value: number) {
        value = Math.round(value)

        if (value <= 0)
            value = Infinity

        this._maxListeners = value
    }

    // Helper 

    protected _addListener<K extends StringKeys<T>>(
        event: K,
        listener: EventListener<T, K>,
        options?: {
            /**
             * Internal listeners will not be removed by public removal methods.
             * False by default.
             */
            internal?: boolean

            /**
             * Number of times the listener will be invoked before being removed.
             * Infinity by default.
             */
            invocations?: number

            /**
             * Listener will be invoked before other registered listeners.
             * False by default.
             */
            prepend?: boolean
        }
    ): void {

        const subscription = this._subscriptions[event] ?? (this._subscriptions[event] = []) as
            EventSubscription<T, K>[]

        const { prepend = false, internal = false, invocations = Infinity } = options ?? {}

        const method = prepend ? `unshift` : `push`

        if (subscription.length + 1 > this.maxListeners) {
            throw new Error(
                `Cannot add more than ${this.maxListeners} ` +
                `listeners for the "${event}" event.`
            )
        }

        if (invocations < 1) {
            throw new Error(
                `Number of invocations must be 1 or higher.`
            )
        }

        subscription[method]({
            listener,
            invocations,
            internal
        })
    }

    protected _removeListener<K extends StringKeys<T>>(
        event: K,
        listener: EventListener<T, K>,
        options?: {
            /**
             * Remove subscribers marked as internal.
             * False by default.
             */
            internal?: boolean
        }
    ): void {

        const subscriptions = this._subscriptions[event]
        if (!subscriptions)
            return

        const { internal: removeInternal = false } = options ?? {}

        // const index = listeners.findLastIndexOf(item => item.listener === listener)
        let index = -1
        for (let i = subscriptions.length - 1; i >= 0; i--) {
            const subscription = subscriptions[i]
            if (
                subscription.listener === listener &&
                (!subscription.internal || removeInternal)
            ) {
                index = i
                break
            }
        }

        if (index >= 0)
            subscriptions.splice(index, 1)
    }

}

//// Exports ////

export default EventEmitter

export {
    EventEmitter,
    EventListener
}