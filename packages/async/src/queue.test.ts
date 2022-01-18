import { Queue } from './queue'
import milliseconds from './milliseconds'

import { EventEmitter } from 'events'

describe('queue', () => {

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

    describe('options.maxConcurrent', () => {

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

        describe('Executes concurrent tasks', () => {

            const maxConcurrent = 4
            const totalTasks = 6
            const states = [Array.from({ length: totalTasks }, () => 'idle')]

            beforeAll(async () => {

                const queue = new Queue({ maxConcurrent })

                const emitter = new EventEmitter()

                emitter.on('update', (index: number, value: 'run' | 'stop') => {
                    const lastState = states[states.length - 1]
                    const nextState = [...lastState]
                    nextState[index] = value

                    states.push(nextState)
                })

                for (let i = 0; i < totalTasks; i++) {
                    queue.add(async () => {
                        emitter.emit('update', i, 'run')
                        await milliseconds(1)
                        emitter.emit('update', i, 'stop')
                    })
                }

                await milliseconds(200)

                console.log(states)
            })

            it('Runs maxConcurrent number of states simultaneously', () => {
                // Runs maxConcurrent tasks simultaneously
                expect(states.some(state =>
                    state.filter(value => value === 'run').length === maxConcurrent
                )).toBe(true)
            })

            it('Never runs more than maxConcurrent number of states', () => {
                expect(states.every(state =>
                    state.filter(value => value === 'run').length <= maxConcurrent
                ))
            })

            it('Runs every item in the queue', () => {

                const stateIndexesThatContainRun = Array
                    .from(
                        { length: totalTasks },
                        (_, i) => states.some(state => state[i] === 'run')
                    )

                expect(stateIndexesThatContainRun.every(state => state === true))
                    .toBe(true)
            })

        })
    })
})