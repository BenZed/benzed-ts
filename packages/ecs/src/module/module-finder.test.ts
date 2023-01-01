
import { nil } from '@benzed/util'
import { test, expect, it, describe } from '@jest/globals'

import { AssertModule, FindFlag, FindModule, FindModules, HasModule, ModuleFinder } from './module-finder'
import { Module } from './module'
import { Node } from '../node'

//// Types ////

class Rank<S extends string> extends Module<S> {  

    static of<Sx extends string>(rank: Sx): Rank<Sx> {
        return new Rank(rank)
    }

    getRank(): S {
        return this.data
    }

}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createFamilyTreeAndFinder = (flag?: FindFlag) => {

    const node = Node.build.bind(Node)
    const rank = Rank.of.bind(Rank) 
    
    const tree = node({
        aunt: node(rank('aunt')),
        uncle: node(rank('uncle')),
        mom: node(
            {
                you: node(
                    {
                        son: node(rank('son')),
                        daughter: node(
                            {
                                grandSon: node(rank('grandSon')),
                                grandDaughter: node(rank('grandDaughter'))
                            },
                            rank('daughter')
                        ),
                    },
                    rank('you')
                ),
                sister: node(
                    {
                        neice: node(rank('neice')),
                        nephew: node(rank('nephew'))
                    },
                    rank('sister')
                )
            },
            rank('mom')
        )
    },
    rank('grandDad'))

    const you = tree.nodes.mom.nodes.you
    const finder: FindModule | FindModules | AssertModule | HasModule = new ModuleFinder(you, flag as FindFlag.All)

    return [ finder, tree, you ] as const
}

//// Exports ////

for (const scope of ['inDescendents', 'inChildren', 'inParents', 'inAncestors'] as const) {
    for (const flag of [FindFlag.Assert, FindFlag.All] as const) {
        it(`input scope ${scope} ${flag ? 'with flag ' + flag.toString() : ''}`.trim(), () => {

            const [ finder ] = createFamilyTreeAndFinder(flag)

            const target = {

                inDescendents: Rank.of('grandSon'),  
                inChildren: Rank.of('son'),
                inParents: Rank.of('mom'),
                inAncestors: Rank.of('uncle'),

            }[scope]

            const found = finder[scope](target)
            if (flag === FindFlag.All)
                expect(found).toBeInstanceOf(Array)
            else 
                expect(found).toBeInstanceOf(Rank)

            if (flag === FindFlag.Assert)
                expect(() => finder(Rank.of('invalid'))).toThrow('Could not find')
        })
    }
}

describe('callable signature', () => {
    it('in nodes, defaults to children', () => {
        const [ finder,,you ] = createFamilyTreeAndFinder()
        expect(finder(Module)).toEqual(you.modules.at(0))
        expect(finder(Module.data('non-existant'))).toEqual(nil)
    })
    it('in modules, defaults to siblings', () => {
        const [,,you] = createFamilyTreeAndFinder()
        const [youRank] = you.modules
        const youRankFind = new ModuleFinder(you)
        expect(youRankFind(Module)).toEqual(youRank)
    })
})

describe('find via constructor', () => {
    test('Module', () => {
        const [finder] = createFamilyTreeAndFinder()
        const rank = finder.inParents(Rank)
        expect(rank).not.toBe(nil)
    })
})

it('require flag', () => {
    const [finder] = createFamilyTreeAndFinder(FindFlag.Assert)
    expect(() => finder.inAncestors(Module.data('cheese'))).toThrow('Could not find module')
})

it('all flag', () => {
    const [ finder,,you ] = createFamilyTreeAndFinder(FindFlag.All)
    expect(finder.inParents(Module)).toEqual(you.parents.flatMap((p: Node) => p.findModule(Module)))
})
