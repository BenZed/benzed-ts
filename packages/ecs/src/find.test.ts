
import { nil } from '@benzed/util'

import { Finder } from './find'
import State from './module'
import { Node } from './node'

class Rank<S extends string> extends State<S> {

    static of<Sx extends string>(rank: Sx): Rank<Sx> {
        return new Rank(rank)
    }

    getRank(): S {
        return this.data
    }

}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createFamilyTreeAndFinder = () => {

    const node = Node.from.bind(Node)
    const rank = Rank.of.bind(Rank) 
    
    const tree = node(
        node(
            rank('uncle')
        ),
        node(
            rank('mom'),
            node(
                rank('brother'),
            ),
            node(
                rank('you'),
                node(
                    rank('son')
                ),
                node(
                    rank('daughter'),
                    node(
                        rank('grandson')
                    )
                )
            ),
            node(
                rank('sister'),
                node(
                    rank('neice'),
                ),
                node(
                    rank('nephew')
                )
            )
        ),
        node(
            rank('uncle')
        )
    )

    const you = tree.get(1).get(2)
    const finder = new Finder(you)

    return [ finder, tree, you ] as const
}

//// Exports ////

for (const scope of ['inDescendents', 'inChildren', 'inSiblings', 'inParents', 'inAncestors'] as const) {
    for (const flag of ['require', 'all', undefined] as const) {
        it(`input scope ${scope} ${flag ? 'with flag ' + flag : ''}`.trim(), () => {

            const [ finder, tree ] = createFamilyTreeAndFinder()

            const target = {

                inDescendents: Node.from(Rank.of('grandson')),
                inChildren: Node.from(Rank.of('son')),
                inSiblings: Node.from(Rank.of('brother')),
                inParents: tree,
                inAncestors: Node.from(Rank.of('uncle')),

            }[scope]

            const findWithFlag = flag ? finder[flag] : finder
            const found = findWithFlag[scope](target)
            if (flag === 'all')
                expect(found).toBeInstanceOf(Array)
            else 
                expect(found).toBeInstanceOf(Node)

            if (flag === 'require')
                expect(() => findWithFlag(Rank.of('invalid'))).toThrow('Could not find')
        })
    }
}

describe('callable signature', () => {
    it('in nodes, defaults to children', () => {
        const [ finder,,you ] = createFamilyTreeAndFinder()
        expect(finder(State)).toEqual(you.modules.at(0))
        expect(finder(Node.from())).toEqual(nil)
    })
    it('in modules, defaults to siblings', () => {
        const [,, you] = createFamilyTreeAndFinder()
        const youRank = you.get(0)
        const youRankFind = new Finder(youRank)
        expect(youRankFind(State)).toEqual(youRank.siblings.at(0))

    })
})

it('require flag', () => {
    const [finder, tree, you] = createFamilyTreeAndFinder()
    expect(() => finder.require.inAncestors(Node.from(State.data('cheese')))).toThrow('Could not find module')
    const root = finder.require.inAncestors(you.root)
    expect(root).toEqual(tree)
})

it('all flag', () => {
    const [ finder,,you ] = createFamilyTreeAndFinder()
    expect(finder.all.inParents(State)).toEqual(you.parents)
})
