import { isQueuePayload, Queue } from './queue'
import milliseconds from './milliseconds'

describe('queue', () => {

    jest.setTimeout(500)

    it('executes a series of tasks in order', async () => {

        const queue = new Queue()

        const task = async (): Promise<'complete'> => {
            await milliseconds(1)
            return 'complete'
        }

        const item = queue.add(task)

        await milliseconds(10)

        expect(item.value).toEqual('complete')
    })

    describe('maxListeners option', () => {

        it('provides the max number of listeners to the Queue and item emitters', () => {

            const queue = new Queue({ maxListeners: 64 })
            const item = queue.add(jest.fn())

            expect(queue.maxListeners).toBe(64)
            expect(item.maxListeners).toBe(64)

        })
    })

    describe('maxTotalItems option', () => {

        it('Must be 1 or higher', () => {
            expect(() => new Queue({ maxTotalItems: 0 }))
                .toThrow('options.maxTotalItems must be 1 or higher.')
        })

        it('Must be a whole number', () => {
            for (const badNumber of [1.5, NaN]) {
                expect(() => new Queue({ maxTotalItems: badNumber }))
                    .toThrow('options.maxTotalItems must be a whole number.')
            }
        })

        it('Error is thrown if too many items are queued', () => {

            const queue = new Queue({ maxTotalItems: 2 })

            queue.add(jest.fn())
            queue.add(jest.fn())

            expect(() => queue.add(jest.fn()))
                .toThrow('Cannot queue more than 2 items.')
        })
    })

    describe('maxConcurrent option', () => {

        it('Must be 1 or higher', () => {
            expect(() => new Queue({ maxConcurrent: 0 }))
                .toThrow('options.maxConcurrent must be 1 or higher.')
        })

        it('Must be a whole number', () => {
            for (const badNumber of [1.5, NaN]) {
                expect(() => new Queue({ maxConcurrent: badNumber }))
                    .toThrow('options.maxConcurrent must be a whole number.')
            }
        })

        it('Cannot be infinite', () => {
            expect(() => new Queue({ maxConcurrent: Infinity }))
                .toThrow('options.maxConcurrent cannot be Infinite.')
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

                const queue = new Queue({ maxConcurrent: MAX_CONCURRENT })

                for (let taskId = 0; taskId < TOTAL_TASKS; taskId++) {
                    const item = queue.add(() => milliseconds(taskId * 5))
                    //       progressivly more difficult tasks ^

                    item.once('start', () => addTaskState(taskId, '🏃'))
                    item.once('complete', () => addTaskState(taskId, '🛑'))
                }

                await queue.finished()

                // UnComment this to see the state visualization
                // ⌛ represents waiting tasks 
                // 🏃 represents running tasks
                // 🛑 represents finished tasks 

                /*
                console.log(
                    taskStates
                        .map(state => state.join(''))
                        .join('\n')
                )
                */

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

            const itemPrePause = queue.add(jest.fn())

            queue.isPaused = true

            const itemPostPause = queue.add(jest.fn())

            await milliseconds(25)

            expect(itemPrePause.isStarted).toBe(true)
            expect(itemPrePause.isFinished).toBe(true)

            expect(itemPostPause.isStarted).toBe(false)
            expect(itemPostPause.isFinished).toBe(false)
        })
    })

    describe('events', () => {

        it('"start" event fires when task is begun', async () => {

            const queue = new Queue<number>()

            const getNumberTask = (): number => 0

            const item = queue.add(getNumberTask)

            item.on('start', ({ item }) => {
                expect(item.value).toBe(undefined)
            })

            await item.finished()

            expect.assertions(1)

        })

        it('"complete" event fires when task is complete', async () => {

            const queue = new Queue<boolean>()

            const doThing = (): boolean => true

            const item = queue.add(doThing)

            const callback = jest.fn()

            item.on('complete', callback)

            await item.finished()

            expect(callback).toHaveBeenCalledTimes(1)

        })

        it('"complete" event first argument is a payload if queue type is void or undefined',
            async () => {

                const callback = jest.fn()

                const strQ = new Queue<string>()
                strQ.on('complete', (output) => {
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
                    strQ.finished(),
                    voidQ.finished(),
                    undefQ.finished()
                ])

                expect(strItem.error).toEqual(undefined)
                expect(voidItem.error).toEqual(undefined)
                expect(undefItem.error).toEqual(undefined)
                expect(callback).toBeCalledTimes(3)

            })

        it('"error" event fires when task throws an error', async () => {

            const queue = new Queue<boolean>()

            const uhOh = (): boolean => {
                throw new Error('Done fucked up there bud')
            }

            const item = queue.add(uhOh)

            const callback = jest.fn()

            item.on('error', callback)

            await queue.finished()

            expect(callback).toHaveBeenCalledTimes(1)
            expect(item.error).toHaveProperty('message', 'Done fucked up there bud')
        })

        it('.removeAllListeners() does not break internal events', async () => {

            const queue = new Queue<'ham'>()

            const getHam = (): 'ham' => 'ham'

            const item = queue.add(getHam)
            item.removeAllListeners('start')
            item.removeAllListeners('complete')
            item.removeAllListeners('error')

            await item.finished()

            expect(item.isStarted).toBe(true)
        })

        it('.finished() promises resolve when already finished', async () => {

            const queue = new Queue()

            const item = queue.add(() => void 0)

            await Promise.all([
                item.finished(),
                queue.finished()
            ])

            await Promise.all([
                item.finished(),
                queue.finished()
            ])
        })
    })
})