import { Func } from './types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/unified-signatures
*/

type BenchmarkHandler<T> = Func<[time: number, result: Sync<T>], void | string>

type Sync<T> = T extends PromiseLike<infer U> ? U : T

/*** Helper ***/

function onBenchmarkComplete(
    this: {
        start: number
        name: string
        handler: BenchmarkHandler<any> | string | undefined
    },
    syncResult: unknown,
    wasAsync = true
): void {
    const delta = Date.now() - this.start

    let { handler } = this
    if (handler === undefined) {
        handler = [
            this.name,
            wasAsync ? 'resolved' : 'completed',
            syncResult === undefined
                ? ''
                : 'with value ' + String(syncResult),

            `in ${delta} ms`

        ].filter(a => a).join(' ')
    }

    if (typeof handler === 'function')
        handler = handler(delta, syncResult) || ''

    if (handler && typeof handler === 'string')
        console.log(handler, delta)
}

/*** Main ***/

/**
 * Return a function that logs the provided message when it
 * (a)syncronously resolves.
 */
function benchmark<A extends any[], R, T = void>(
    func: Func<A, R, T>,
    msg: string
): Func<A, R, T>

/**
 * Return a function that executes a callback when it
 * (a)syncronously resolves. If that callback returns a
 * string, that string will be logged.
 */
function benchmark<A extends any[], R, T = void>(
    func: Func<A, R, T>,
    onComplete: BenchmarkHandler<R>,
): Func<A, R, T>

function benchmark<A extends any[], R, T = void>(
    func: Func<A, R, T>,
    handler?: string | BenchmarkHandler<R>,
): Func<A, R, T> {

    return function (this: T, ...args: A) {

        const onComplete = onBenchmarkComplete.bind({
            start: Date.now(),
            name: func.name || 'task',
            handler
        })

        const result = func.apply(this, args)

        if (result instanceof Promise)
            result.then(onComplete)
        else
            onComplete(result as Sync<R>, false)

        return result
    }

}

benchmark(() => 0, (t, n) => `got ${n} in ${t} ms`)

/*** Exports ***/

export default benchmark

export {
    benchmark
}