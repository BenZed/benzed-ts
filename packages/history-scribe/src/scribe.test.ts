import HistoryScribe from './scribe'

describe('HistoryScribe class', () => {

    type Structure = {
        floors: {
            rooms: number
        }[]
        stage: 'carpentry' | 'painting' | 'finishing'
        type: 'industrial' | 'residential' | 'commercial'
        finished: boolean
    }

    describe('construction', () => {
        it('has default options', () => {
            const scribe = new HistoryScribe()
            expect(scribe.options.collapseInterval).toBe(0)
        })
    })

    describe('create', () => {
        it('returns a new object with initialized history property', () => {
            const scribe = new HistoryScribe<Structure>()

            const data = {
                floors: [{ rooms: 1 }, { rooms: 2 }],
                stage: 'carpentry' as const,
                type: 'industrial' as const,
                finished: false
            }

            const structure = scribe.create(data).compile()
            expect(structure).toEqual({
                ...data,
                history: [{
                    method: 'create',
                    data,
                    timestamp: expect.any(Number),
                    signature: null
                }]
            })
        })
    })

    describe('patch', () => {

        it('throws if provided date meta-data is not in order', () => {
            const data = {
                floors: [{ rooms: 1 }, { rooms: 2 }],
                stage: 'carpentry' as const,
                type: 'industrial' as const,
                finished: false
            }

            const scribe = new HistoryScribe<Structure>({ data })

            expect(() => {
                scribe.patch({
                    stage: 'painting' as const
                }, {
                    timestamp: new Date(2019, 1, 1).getTime()
                })
            }).toThrow()
        })

        it('undefined data is ignored', () => {
            const data = {
                floors: [{ rooms: 1 }, { rooms: 2 }],
                stage: 'carpentry' as const,
                type: 'industrial' as const,
                finished: false
            }

            const scribe = new HistoryScribe<Structure>()
                .create(data)
                .patch({
                    stage: undefined,
                    type: 'commercial'
                })

            const structure = scribe.compile()

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const patchEntryData = (structure.history.at(-1) as any)?.data
            expect(patchEntryData).toEqual({
                type: 'commercial'
            })
            expect('stage' in patchEntryData).toBe(false)
            expect(structure).toHaveProperty('stage', 'carpentry')
        })

        it('returns a new object with updated history property', () => {

            const data = {
                floors: [{ rooms: 1 }, { rooms: 2 }],
                stage: 'carpentry' as const,
                type: 'industrial' as const,
                finished: false
            }

            const scribe1 = new HistoryScribe<Structure>({ data })

            const scribe2 = scribe1.patch({
                stage: 'painting' as const,
            })

            expect(scribe2).not.toBe(scribe1) // proof of immutability
            expect(scribe2.compile()).not.toBe(scribe1.compile())
            expect(scribe2.compile()).toEqual({
                ...data,
                stage: 'painting',
                history: [
                    {
                        method: 'create',
                        data,
                        timestamp: expect.any(Number),
                        signature: null
                    },
                    {
                        method: 'patch',
                        data: {
                            stage: 'painting'
                        },
                        timestamp: expect.any(Number),
                        signature: null
                    }
                ]
            })
        })

        it('collapses multiple updates with matching meta data into one', () => {

            const data = {
                floors: [{ rooms: 1 }, { rooms: 2 }],
                stage: 'carpentry' as const,
                type: 'industrial' as const,
                finished: false
            }

            const scribe = new HistoryScribe<Structure>({
                collapseInterval: 1000,
                data
            }).patch({
                stage: 'painting' as const,
            }).patch({
                stage: 'finishing' as const,
            })

            expect(scribe.compile()).toEqual({
                ...data,
                stage: 'finishing',
                history: [
                    {
                        method: 'create',
                        data,
                        timestamp: expect.any(Number),
                        signature: null
                    },
                    {
                        method: 'patch',
                        data: {
                            stage: 'finishing'
                        },
                        timestamp: expect.any(Number),
                        signature: null
                    }
                ]
            })
        })

        it('throws if no create entry is on the history stack', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const scribe = new HistoryScribe<any>()

            expect(() => {
                scribe.patch({
                    stage: 'painting' as const,
                })
            }).toThrow(
                'History output invalid: "patch" entry must be placed after a "create" entry.'
            )
        })

        it('throws if a remove entry is on the history stack', () => {

            const scribe = new HistoryScribe<Structure>()

            expect(() => {
                scribe
                    .create({
                        floors: [{ rooms: 1 }, { rooms: 2 }],
                        stage: 'carpentry' as const,
                        type: 'industrial' as const,
                        finished: false
                    })
                    .remove()
                    .patch({
                        stage: 'painting' as const,
                    })
            }).toThrow('History output invalid: "patch" entry cannot be after a "remove" entry.')
        })

        it('empty entries are ignored', () => {
            const scribe = new HistoryScribe<Structure>()

            const structure = scribe
                .create({
                    floors: [{ rooms: 1 }, { rooms: 2 }],
                    stage: 'carpentry' as const,
                    type: 'industrial' as const,
                    finished: false
                })
                .patch({})
                .compile()

            expect(structure.history).toHaveLength(1)
        })

        it('patches that do not change any properties are ignored', () => {
            const scribe = new HistoryScribe<Structure>({ collapseInterval: 0 })
                .create({
                    floors: [{ rooms: 1 }, { rooms: 2 }],
                    stage: 'carpentry',
                    type: 'industrial',
                    finished: false
                })
                .patch({
                    stage: 'painting'
                })

            const structure1 = scribe.compile()

            const structure2 = scribe
                .patch({
                    stage: 'painting',
                })
                .compile()

            expect(structure1).toEqual(structure2)
        })

        it('properties in patches that make no changes are omitted in history', () => {
            const scribe = new HistoryScribe<Structure>()
                .create({
                    floors: [{ rooms: 1 }, { rooms: 2 }],
                    stage: 'carpentry',
                    type: 'industrial',
                    finished: false
                })
                .patch({
                    floors: [{ rooms: 1 }, { rooms: 2 }],
                    stage: 'painting',
                })

            expect(scribe.compile().history).toEqual([{
                method: 'create',
                data: {
                    floors: [{ rooms: 1 }, { rooms: 2 }],
                    stage: 'carpentry',
                    type: 'industrial',
                    finished: false
                },
                timestamp: expect.any(Number),
                signature: null
            }, {
                method: 'patch',
                data: {
                    stage: 'painting',
                },
                timestamp: expect.any(Number),
                signature: null
            }])
        })

        it('redundant patches are correctly ignored after collapsing', () => {
            const scribe = new HistoryScribe<Structure>({
                collapseInterval: 500
            })
                .create(
                    {
                        floors: [{ rooms: 1 }, { rooms: 2 }],
                        stage: 'carpentry' as const,
                        type: 'industrial' as const,
                        finished: false
                    },
                    { timestamp: new Date(1000).getTime() }
                ).patch(
                    { stage: 'painting' },
                    { timestamp: new Date(2000).getTime() }
                ).patch(
                    { stage: 'painting' },
                    { timestamp: new Date(3000).getTime() }
                ).patch(
                    { stage: 'painting' },
                    { timestamp: new Date(3400).getTime() }
                )

            const structure = scribe.compile()

            expect(structure.stage).toBe('painting')
            expect(structure.history).toEqual([
                {
                    method: 'create',
                    data: {
                        floors: [{ rooms: 1 }, { rooms: 2 }],
                        stage: 'carpentry' as const,
                        type: 'industrial' as const,
                        finished: false
                    },
                    signature: null,
                    timestamp: 1000
                }, {
                    method: 'patch',
                    data: {
                        stage: 'painting'
                    },
                    signature: null,
                    timestamp: 2000
                }
            ])
        })

        it('patches containing data with collapseBlockKeys will not be collapsed', () => {
            const scribe = new HistoryScribe<Structure>({
                collapseInterval: 500,
                collapseMask: ['stage'] as const
            })
            const structure = scribe
                .create({
                    floors: [{ rooms: 1 }, { rooms: 2 }],
                    stage: 'carpentry' as const,
                    type: 'industrial' as const,
                    finished: false
                })
                .patch({ stage: 'painting' })
                .patch({ stage: 'finishing' })
                .patch({ stage: 'finishing' })
                .compile()

            expect(structure.history).toHaveLength(3)
        })
    })

    describe('remove', () => {

        it('returns a new object with updated history property', () => {

            const data = {
                floors: [{ rooms: 1 }, { rooms: 2 }],
                stage: 'carpentry' as const,
                type: 'industrial' as const,
                finished: false
            }

            const scribe = new HistoryScribe<Structure>({
                data
            })

            const structure1 = scribe.compile()
            const structure2 = scribe.remove().compile()

            expect(structure2).not.toBe(structure1) // proof of immutability
            expect(structure2).toEqual({
                ...data,
                history: [
                    {
                        method: 'create',
                        data,
                        timestamp: expect.any(Number),
                        signature: null
                    },
                    {
                        method: 'remove',
                        timestamp: expect.any(Number),
                        signature: null
                    }
                ]
            })
        })

        it('consecutive remove entries are thrown', () => {

            const data = {
                floors: [{ rooms: 1 }, { rooms: 2 }],
                stage: 'carpentry' as const,
                type: 'industrial' as const,
                finished: false
            }
            const scribe = new HistoryScribe<Structure>({ data })

            expect(() => scribe.remove().remove())
                .toThrow('History output invalid: There can only be one "remove" entry.')
        })

        it('throws if no create entry is on the history stack', () => {
            const scribe = new HistoryScribe<Structure>()

            expect(() => scribe.remove()).toThrow()
        })
    })

    describe('revert', () => {

        it('returns a new historical object omitting changes from index', () => {

            const data = {
                floors: [{ rooms: 1 }, { rooms: 2 }],
                stage: 'carpentry' as const,
                type: 'industrial' as const,
                finished: false
            }

            const scribe = new HistoryScribe<Structure>()
                .create(data)
                .patch({
                    stage: 'painting' as const,
                })
                .patch({
                    stage: 'finishing' as const,
                })
                .revert(2)

            expect(scribe.compile()).toEqual({
                ...data,
                stage: 'painting',
                history: [
                    {
                        method: 'create',
                        data,
                        timestamp: expect.any(Number),
                        signature: null
                    },
                    {
                        method: 'patch',
                        data: {
                            stage: 'painting'
                        },
                        timestamp: expect.any(Number),
                        signature: null
                    }
                ]
            })
        })

        it('returns a new historical object with entries after revert date removed', () => {

            const data = {
                floors: [{ rooms: 1 }, { rooms: 2 }],
                stage: 'carpentry' as const,
                type: 'industrial' as const,
                finished: false
            }

            const scribe = new HistoryScribe<Structure>()
                .create(data, { timestamp: new Date(1000).getTime() })
                .patch({ stage: 'painting' }, { timestamp: new Date(2000).getTime() })
                .patch({ stage: 'finishing', }, { timestamp: new Date(3000).getTime() })
                .patch({ finished: true }, { timestamp: new Date(4000).getTime() })
                .revert(new Date(2500))

            expect(scribe.compile()).toEqual({
                ...data,
                stage: 'painting',
                history: [
                    {
                        method: 'create',
                        data,
                        timestamp: expect.any(Number),
                        signature: null
                    },
                    {
                        method: 'patch',
                        data: {
                            stage: 'painting'
                        },
                        timestamp: expect.any(Number),
                        signature: null
                    }
                ]
            })
        })

        it('index can be wrapped', () => {

            const data = {
                floors: [{ rooms: 1 }, { rooms: 2 }],
                stage: 'carpentry' as const,
                type: 'industrial' as const,
                finished: false
            }

            const scribe = new HistoryScribe<Structure>()
                .create(data)
                .patch({ stage: 'painting' })
                .patch({ stage: 'finishing' })
                .revert(-1)

            expect(scribe.compile()).toEqual({
                ...data,
                stage: 'painting',
                history: [
                    {
                        method: 'create',
                        data,
                        timestamp: expect.any(Number),
                        signature: null
                    },
                    {
                        method: 'patch',
                        data: {
                            stage: 'painting'
                        },
                        timestamp: expect.any(Number),
                        signature: null
                    }
                ]
            })
        })

        it('throws on index 0', () => {
            const scribe = new HistoryScribe<Structure>()

            const data = {
                floors: [{ rooms: 1 }, { rooms: 2 }],
                stage: 'carpentry' as const,
                type: 'industrial' as const,
                finished: false
            }

            expect(() => {
                scribe
                    .create(data)
                    .revert(0)
            }).toThrow('History output invalid: No entries.')
        })
    })

    describe('replace', () => {

        it('allows a historical object to be built out of a series of entries', () => {

            const scribeOriginal = new HistoryScribe<Structure>()
                .create({
                    floors: [{ rooms: 4 }],
                    stage: 'painting' as const,
                    type: 'residential' as const,
                    finished: true
                })

            const scribeReplaced = scribeOriginal.replace([
                {
                    method: 'create',
                    data: {
                        floors: [{ rooms: 1 }, { rooms: 2 }],
                        stage: 'carpentry' as const,
                        type: 'industrial' as const,
                        finished: false
                    },
                    signature: null,
                    timestamp: new Date(1000).getTime()
                },
                {
                    method: 'patch',
                    data: {
                        stage: 'painting'
                    },
                    signature: null,
                    timestamp: new Date(2000).getTime()
                },
                {
                    method: 'patch',
                    data: {
                        finished: true
                    },
                    signature: null,
                    timestamp: new Date(3000).getTime()
                }, {
                    method: 'remove',
                    signature: null,
                    timestamp: new Date(4000).getTime()
                }
            ])

            expect(scribeReplaced.compile()).toEqual({
                floors: [{ rooms: 1 }, { rooms: 2 }],
                finished: true,
                stage: 'painting',
                type: 'industrial',
                history: [
                    {
                        method: 'create',
                        data: {
                            floors: [{ rooms: 1 }, { rooms: 2 }],
                            stage: 'carpentry' as const,
                            type: 'industrial' as const,
                            finished: false
                        },
                        signature: null,
                        timestamp: 1000
                    }, {
                        method: 'patch',
                        data: {
                            stage: 'painting'
                        },
                        signature: null,
                        timestamp: 2000
                    }, {
                        method: 'patch',
                        data: {
                            finished: true
                        },
                        signature: null,
                        timestamp: 3000
                    }, {
                        method: 'remove',
                        signature: null,
                        timestamp: 4000
                    }
                ]
            })
        })

    })

    describe('splice', () => {

        it('returns a new historical object with entries removed', () => {

            const data = {
                floors: [{ rooms: 1 }, { rooms: 2 }],
                stage: 'carpentry' as const,
                type: 'industrial' as const,
                finished: false
            }

            const scribe = new HistoryScribe<Structure>()
                .create(data)
                .patch({
                    stage: 'painting' as const,
                })
                .patch({
                    stage: 'finishing' as const,
                })
                .patch({
                    finished: true,
                })
                .remove()
                .splice(2, 2)

            expect(scribe.compile()).toEqual({
                ...data,
                stage: 'painting',
                history: [
                    {
                        method: 'create',
                        data,
                        timestamp: expect.any(Number),
                        signature: null
                    },
                    {
                        method: 'patch',
                        data: {
                            stage: 'painting'
                        },
                        timestamp: expect.any(Number),
                        signature: null
                    },
                    {
                        method: 'remove',
                        timestamp: expect.any(Number),
                        signature: null
                    }
                ]
            })
        })

        it('throws if operation results in an invalid entry list', () => {

            const data = {
                floors: [{ rooms: 1 }, { rooms: 2 }],
                stage: 'carpentry' as const,
                type: 'industrial' as const,
                finished: false
            }

            const scribe = new HistoryScribe<Structure>()
                .create(data)
                .patch({
                    stage: 'painting' as const,
                })
                .remove()

            expect(() => scribe.splice(0, 1))
                .toThrow(
                    'History output invalid: "patch" entry must be placed after a "create" entry.'
                )
        })
    })
})