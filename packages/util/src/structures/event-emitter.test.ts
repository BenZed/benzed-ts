import EventEmitter from './event-emitter'

describe('Event Emitter', () => {

    for (const addMethod of ['on', 'addListener'] as const) {
        describe(`.${addMethod}`, () => {

            it('allows callbacks to be invoked via .emit', () => {

                const emitter = new EventEmitter<{
                    'hello': [greeting: 'world']
                }>()

                emitter[addMethod]('hello', value => {
                    expect(value).toBe('world')
                })

                emitter.emit('hello', 'world')

                // @ts-expect-error world1 should not be assignable
                void (() => emitter.emit('hello', 'my-new-friend'))

                expect.assertions(1)
            })
        })
    }

    for (const onceMethod of ['once', 'addOnceListener'] as const) {
        describe(`.${onceMethod}`, () => {

            it('invokes a callback only once', () => {

                const emitter = new EventEmitter<{
                    'favourite-number': [number]
                }>()

                const callback = jest.fn()

                emitter[onceMethod]('favourite-number', callback)
                emitter.emit('favourite-number', 0)
                emitter.emit('favourite-number', 0)

                expect(callback).toHaveBeenCalledTimes(1)
            })
        })
    }

    for (const removeMethod of ['off', 'removeListener'] as const) {
        describe(`.${removeMethod}`, () => {

            it('removes a listener', () => {

                const emitter = new EventEmitter<{
                    'start': []
                }>()

                const callback = jest.fn()

                emitter.on('start', callback)
                emitter.emit('start')

                emitter[removeMethod]('start', callback)
                emitter.emit('start')

                expect(callback).toHaveBeenCalledTimes(1)
            })
        })
    }

    describe('.prependListener', () => {

        it(
            'adds a listener that executes before other registered ' +
            'listeners, as opposed to last', () => {

                const emitter = new EventEmitter()

                const stack: number[] = []

                emitter.addListener('hello', () => {
                    stack.push(1)
                })
                emitter.prependListener('hello', () => {
                    stack.push(0)
                })

                emitter.emit('hello')

                expect(stack).toEqual([0, 1])
            })

    })

    describe('.prependOnceListener', () => {

        it(
            'adds a listener that executes once before other registered ' +
            'listeners, as opposed to last', () => {

                const emitter = new EventEmitter()

                const stack: number[] = []

                emitter.addListener('hello', () => {
                    stack.push(1)
                })
                emitter.prependOnceListener('hello', () => {
                    stack.push(0)
                })

                emitter.emit('hello')
                emitter.emit('hello')

                expect(stack).toEqual([0, 1, 1])
            })
    })

    describe('.removeAllListeners', () => {
        it('removes all listeners', () => {

            const emitter = new EventEmitter()

            const listener = jest.fn()

            emitter.addListener('hello', listener)
            emitter.addListener('hello', listener)
            emitter.emit('hello')

            emitter.removeAllListeners('hello')
            emitter.emit('hello')
            emitter.emit('hello')

            expect(listener).toHaveBeenCalledTimes(2)
        })
    })

    describe('.listenerCount', () => {

        it('Returns how many subscribers a given event has', () => {

            const emitter = new EventEmitter<{
                'go': []
            }>()

            emitter.on('go', jest.fn())

            expect(emitter.getNumListeners('go')).toBe(1)
        })

        it('Number of listeners is updated when a subscriber is removed', () => {

            const emitter = new EventEmitter<{
                'hello': []
            }>()

            const callback = jest.fn()

            emitter.on('hello', callback)
            emitter.once('hello', callback)
            emitter.on('hello', callback)

            expect(emitter.getNumListeners('hello')).toBe(3)

            emitter.off('hello', callback)
            expect(emitter.getNumListeners('hello')).toBe(2)

            emitter.emit('hello') // removing the callback registerd via .once
            expect(emitter.getNumListeners('hello')).toBe(1)
        })
    })

    describe('.eventNames', () => {

        it('returns a list of event names with registered listeners', () => {
            const emitter = new EventEmitter<{
                'one': []
                'two': []
                'three': []
            }>()

            emitter.addListener('one', jest.fn())
            emitter.addListener('one', jest.fn())
            emitter.addListener('two', jest.fn())
            emitter.addListener('three', jest.fn())
            emitter.removeAllListeners('two')

            expect(emitter.eventNames).toEqual(['one', 'three'])
        })
    })

    describe('.maxListeners', () => {

        it('Optionally a constructor arguement', () => {
            const eventEmitter = new EventEmitter(1)
            expect(eventEmitter.maxListeners).toEqual(1)
        })

        it('Can be set', () => {

            const eventEmitter = new EventEmitter()

            eventEmitter.maxListeners = 5
            expect(eventEmitter.maxListeners).toBe(5)
        })

        it('is rounded', () => {

            const eventEmitter = new EventEmitter()

            eventEmitter.maxListeners = 5.5

            expect(eventEmitter.maxListeners).toEqual(6)

        })

        it('zero === infinity', () => {
            const eventEmitter = new EventEmitter()

            eventEmitter.maxListeners = 0
            expect(eventEmitter.maxListeners).toEqual(Infinity)
        })

        it('Throws an error if too many listeners are registered', () => {
            const eventEmitter = new EventEmitter(1)

            expect(() => {
                eventEmitter.on('hello', jest.fn())
                eventEmitter.on('hello', jest.fn())
            }).toThrow('Cannot add more than 1 listeners for the "hello" event.')
        })

    })

    describe('callbacks', () => {
        it('this is bound to emitter', () => {

            const emitter = new EventEmitter()

            let that: EventEmitter<{ event: [] }> | null = null
            emitter.on('event', function (this: EventEmitter<{ event: [] }>) {
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                that = this
            })

            emitter.emit('event')

            expect(that).toBe(emitter)
        })
    })

    describe('internal listeners', () => {

        class ExtendedEmitter extends EventEmitter<{
            msg: [message: string]
        }> {

            lastMessage = ''
            firstMessage = ''
            secondMessage = ''

            constructor (maxListeners?: number) {
                super(maxListeners)

                this._addListener('msg', msg => {
                    this.lastMessage = msg
                }, { internal: true })

                this._addListener('msg', msg => {
                    this.firstMessage = msg
                }, { internal: true, invocations: 1 })

                this._addListener('msg', msg => {
                    this.secondMessage = msg
                }, { internal: true, invocations: 2 })
            }
        }

        it(
            'extended classes can add internal listeners that are not ' +
            'removed by public methods', () => {

                const emitter = new ExtendedEmitter()

                emitter.removeAllListeners('msg')

                emitter.emit('msg', 'cake')

                expect(emitter.lastMessage).toEqual('cake')

            })

        it(
            'internal listeners respect invocation count', () => {

                const emitter = new ExtendedEmitter()

                emitter.removeAllListeners('msg')

                emitter.emit('msg', '1')
                emitter.emit('msg', '2')
                emitter.emit('msg', '3')

                expect(emitter.firstMessage).toEqual('1')
                expect(emitter.secondMessage).toEqual('2')
                expect(emitter.lastMessage).toEqual('3')

            })

        it(
            'error in case some smartass tries to configure <1 invocations', () => {

                const emitter = new ExtendedEmitter()

                expect(
                    () => {
                        emitter['_addListener']('msg', msg => {
                            throw new Error(msg)
                        }, { internal: true, invocations: 0 })
                    }
                ).toThrow('Number of invocations must be 1 or higher.')

            })

        it('do not contribute to listener count or event names', () => {

            const emitter = new ExtendedEmitter()

            expect(emitter.eventNames).toEqual([])
            expect(emitter.getNumListeners('msg')).toEqual(0)

        })

        it(
            'protected _getEventName and _getNumeListener methods ' +
            'can optionally include internal events', () => {

                const emitter = new ExtendedEmitter()

                expect(emitter['_getEventNames']({ internal: true })).toEqual(['msg'])
                expect(emitter['_getNumListeners']('msg', { internal: true })).toEqual(3)

            })

    })
})