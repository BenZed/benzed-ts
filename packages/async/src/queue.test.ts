import { Func, toFalse, toTrue } from '@benzed/util'

import milliseconds from './milliseconds'
import { isQueuePayload, Queue } from './queue'

import { describe, it, expect, jest, beforeAll } from '@jest/globals'

jest.setTimeout(500)

it('executes a series of tasks in order', async () => {

    const queue = new Queue<string>()

    const task = (): Promise<string> => Promise.resolve('complete')

    const item = queue.add(task)

    await queue.complete()

    expect(item.result?.value).toEqual('complete')
})

describe('maxListeners option', () => {

    it('provides the max number of listeners to the Queue and item emitters', () => {

        const queue = new Queue({ maxListeners: 64 })
        expect(queue.maxListeners).toBe(64)

    })
})

describe('maxTotalItems option', () => {

    it('Must be 1 or higher', () => {
        for (const badNumber of [0, -1, NaN]) {
            expect(() => new Queue({ maxTotalItems: badNumber }))
                .toThrow('options.maxTotalItems must be 1 or higher.')
        }
    })

    it('Must be a whole number', () => {
        expect(() => new Queue({ maxTotalItems: 1.5 }))
            .toThrow('options.maxTotalItems must be infinite or an integer.')
    })

    it('Error is thrown if too many items are queued', () => {

        const queue = new Queue({ maxTotalItems: 2 })

        queue.add(jest.fn<Func>())
        queue.add(jest.fn<Func>())

        expect(() => queue.add(jest.fn<Func>()))
            .toThrow('Cannot queue more than 2 items.')
    })
})

describe('maxConcurrent option', () => {

    it('Must be 1 or higher', () => {
        for (const badNumber of [-1, 0]) {
            expect(() => new Queue({ maxConcurrent: badNumber }))
                .toThrow('options.maxConcurrent must be 1 or higher.')
        }
    })

    it('Must be a whole number', () => {
        for (const badNumber of [1.5, Infinity]) {
            expect(() => new Queue({ maxConcurrent: badNumber }))
                .toThrow('options.maxConcurrent must be an integer.')
        }
    })

    it('sets the number of concurrent tasks', () => {
        const queue = new Queue({ maxConcurrent: 2 })
        expect(queue.maxConcurrent).toEqual(2)
    })

    describe('execute tasks concurrently', () => {

        const MAX_CONCURRENT = 3
        const TOTAL_TASKS = 10

        const taskStates = [Array.from({ length: TOTAL_TASKS }, () => '⌛')]
        const addTaskState = (taskId: number, value: '🏃' | '🛑'): void => {
            const lastState = taskStates[taskStates.length - 1]
            const nextState = [...lastState]
            nextState[taskId] = value

            taskStates.push(nextState)
        }

        beforeAll(async () => {

            const queue = new Queue({ maxConcurrent: MAX_CONCURRENT, maxListeners: 1000 })

            for (let taskId = 0; taskId < TOTAL_TASKS; taskId++) {
                const item = queue.add(() => milliseconds(taskId * 5))
                //       progressivly more difficult tasks ^

                queue.on('start', (payload) => {
                    if (item === payload.item)
                        addTaskState(taskId, '🏃')
                })
                queue.on('complete', (payload) => {
                    if (item === payload.item)
                        addTaskState(taskId, '🛑')
                })
            }

            await queue.complete()

            // UnComment the following block to see the state visualization
            // ⌛ represents waiting tasks 
            // 🏃 represents running tasks
            // 🛑 represents finished tasks 

            // console.log(
            //     taskStates
            //         .map(state => state.join(''))
            //         .join('\n')
            // )

        })

        it('Runs maxConcurrent number of states simultaneously', () => {
            // Runs maxConcurrent tasks simultaneously
            expect(taskStates.some(state =>
                state.filter(value => value === '🏃').length === MAX_CONCURRENT
            )).toBe(true)
        })

        it('Never runs more than maxConcurrent number of states', () => {
            expect(taskStates.every(state =>
                state.filter(value => value === '🏃').length <= MAX_CONCURRENT
            )).toBe(true)
        })

        it('Runs every item in the queue', () => {

            const stateIndexesThatContainRun = Array
                .from(
                    { length: TOTAL_TASKS },
                    (_, i) => taskStates.some(state => state[i] === '🏃')
                )

            expect(stateIndexesThatContainRun.every(state => state === true))
                .toBe(true)
        })
    })
})

describe('add()', () => {

    const queue = new Queue<string>({ initiallyPaused: true })

    const items = [
        queue.add(() => 'hey'),
        queue.add(() => 'ho'),
        queue.add(() => 'lets'),
        queue.add(() => 'go')
    ]

    it('adds tasks to the queue', () => {
        expect(queue.queuedItems).toHaveLength(4)
    })

    it('returns items added', () => {
        expect(items.every(item => queue.queuedItems.includes(item)))
            .toBe(true)
    })

    it('returns an array if given an array', () => {
        const queue = new Queue<string>({ initiallyPaused: true })

        const items = queue.add([() => 'sup', () => 'b'])
        expect(items).toHaveLength(2)
    })

    describe('QueueItem', () => {

        it('stage is updated', async () => {
            const queue = new Queue<string>({ initiallyPaused: true })

            const item = queue.add(() => milliseconds(50).then(() => 'sup'))

            expect(item.stage).toEqual('queued')
            expect(item.isQueued).toBe(true)

            queue.resume()

            await milliseconds(0)

            expect(item.stage).toEqual('current')
            expect(item.isCurrent).toEqual(true)

            await milliseconds(100)
            expect(item.stage).toEqual('complete')
            expect(item.isComplete).toEqual(true)
        })

        it('complete() resolves even if item has already been completed', async () => {

            const queue = new Queue<string>()
            const item = queue.add(() => 'sup')
            await queue.complete()
            const sup = await item.complete()
            expect(sup).toEqual('sup')
        })

    })

})

describe('remove()', () => {

    const queue = new Queue<number>({ initiallyPaused: true })

    const threeTask = (): number => 3

    const items = [
        queue.add(() => 0),
        queue.add(threeTask),
        queue.add(() => 1),
        queue.add(threeTask)
    ]
    const removeViaItem = queue.remove(items[0])
    const removedViaTask = queue.remove(threeTask)

    it('removes items from the queue via item input', () => {
        expect(queue.queuedItems.includes(items[0])).toBe(false)
    })

    it('removes items from the queue via task task input', () => {
        expect(queue.queuedItems.some(item => item === items[1] || item === items[3])).toBe(false)
    })

    it('returns the number of tasks removed', () => {
        expect(removeViaItem).toBe(1)
        expect(removedViaTask).toBe(2)
    })
})

describe('clear()', () => {

    const queue = new Queue<boolean>({ initiallyPaused: true })
    queue.add(toTrue)
    queue.add(toFalse)

    const removed = queue.clear()

    it('removes all items in the queue', () => {
        expect(queue.numQueuedItems).toBe(0)
    })

    it('returns number of removed items', () => {
        expect(removed).toEqual(2)
    })

})

describe('pausing', () => {

    it('initiallyPaused option starts queue in a paused state', () => {

        const queue = new Queue({ initiallyPaused: true })

        expect(queue.isPaused).toBe(true)

    })

    it('pause() method pauses the queue', () => {
        const queue = new Queue()
        expect(queue.isPaused).toEqual(false)

        queue.pause()

        expect(queue.isPaused).toEqual(true)
    })

    it('resume() method unpauses the queue', () => {
        const queue = new Queue({ initiallyPaused: true })
        expect(queue.isPaused).toEqual(true)

        queue.resume()

        expect(queue.isPaused).toEqual(false)
    })

    it('prevents new tasks from being executed', async () => {

        const queue = new Queue()

        const itemPrePause = queue.add(jest.fn<Func>())
        await milliseconds(25)

        queue.isPaused = true
        const itemPostPause = queue.add(jest.fn<Func>())

        expect(itemPrePause.isQueued).toBe(false)
        expect(itemPrePause.isComplete).toBe(true)

        expect(itemPostPause.isQueued).toBe(true)
        expect(itemPostPause.isComplete).toBe(false)
    })
})

describe('events', () => {

    it('"start" event fires when task is begun', async () => {

        const queue = new Queue<number>()

        const getNumberTask = (): number => 0

        const item = queue.add(getNumberTask)

        queue.on('start', ({ item }) => {
            expect(item.result).toBe(null)
        })

        await item.complete()

        expect.assertions(1)

    })

    it('"complete" event fires when task is complete', async () => {

        const queue = new Queue<boolean>()

        const doThing = (): boolean => true

        const item = queue.add(doThing)

        const callback = jest.fn<Func>()

        queue.on('complete', callback)

        await item.complete()

        expect(callback).toHaveBeenCalledTimes(1)

    })

    it('"complete" event second argument is value',
        async () => {

            const callback = jest.fn<Func>()

            const strQ = new Queue<string>()
            strQ.on('complete', (_, output) => {
                expect(typeof output).toBe('string')
            })
            const strItem = strQ.add(() => {
                callback()
                return 'hey'
            })

            const voidQ = new Queue<void>()
            voidQ.on('complete', (payload) => {
                expect(isQueuePayload(payload)).toBe(true)
            })
            const voidItem = voidQ.add(callback)

            const undefQ = new Queue<undefined>()
            undefQ.on('complete', (payload) => {
                expect(isQueuePayload(payload)).toBe(true)
            })
            const undefItem = undefQ.add(callback)

            const funQ = new Queue<string | undefined>()
            funQ.add(() => {
                return 'hey'
            })

            // @ts-expect-error If T is void or undefined, the signature is going to complain.
            funQ.on('complete', (output) => void output)

            await Promise.all([
                strQ.complete(),
                voidQ.complete(),
                undefQ.complete()
            ])

            expect(strItem.error).toEqual(null)
            expect(voidItem.error).toEqual(null)
            expect(undefItem.error).toEqual(null)
            expect(callback).toBeCalledTimes(3)

        })

    it('"error" event fires when task throws an error', async () => {

        const queue = new Queue<boolean>()

        const uhOh = (): boolean => {
            throw new Error('Done fucked up there bud')
        }

        const item = queue.add(uhOh)

        const callback = jest.fn<Func>()

        queue.on('error', callback)

        await queue.complete()

        expect(callback).toHaveBeenCalledTimes(1)
        expect(item.error).toHaveProperty('message', 'Done fucked up there bud')
    })

    it('.removeAllListeners() does not break internal events', async () => {

        const queue = new Queue<'ham'>({})

        const getHam = (): 'ham' => 'ham'

        const item = queue.add(getHam).complete()

        queue.removeAllListeners('start')
        queue.removeAllListeners('complete')
        queue.removeAllListeners('error')

        expect(await item).toBe('ham')
    })

    it('.complete() returns value', async () => {

        const VALUE = 'string-value'

        const queue = new Queue<string>()
        const item = queue.add(async () => {
            await milliseconds(0)
            return VALUE
        })

        const output = await item.complete()
        expect(output).toBe(VALUE)
    })

    it('.complete() promises resolve when already finished', async () => {

        const queue = new Queue()

        const item = queue.add(() => void 0)

        await Promise.all([
            item.complete(),
            queue.complete()
        ])

        await Promise.all([
            item.complete(),
            queue.complete()
        ])
    })
})

describe('extend item', () => {

    const queue = new Queue<number, { count: number }>()

    it('changes the add signature', async () => {

        const item = queue.add({
            count: 10,
            task: (data) => ++data.count
        })

        expect(item).toHaveProperty('count', 10)
        expect(await item.complete()).toEqual(11)
        expect(item).toHaveProperty('count', 11)

    })

})