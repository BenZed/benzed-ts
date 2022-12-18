
import { nil } from '@benzed/util'

import { Finder } from './find'
import Module from './module'
import { Node } from './node'

class Rank<S extends string> extends Module<S> {

    static of<Sx extends string>(rank: Sx): Rank<Sx> {
        return new Rank(rank)
    }

    getRank(): S {
        return this.state
    }

}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createFamilyTreeAndFinder = () => {
    
    const tree = Node.create(
        Node.create(
            Rank.of('uncle')
        ),
        Node.create(
            Rank.of('mom'),
            Node.create(
                Rank.of('brother'),
            ),
            Node.create(
                Rank.of('you'),
                Node.create(
                    Rank.of('son')
                ),
                Node.create(
                    Rank.of('daughter'),
                    Node.create(
                        Rank.of('grandson')
                    )
                )
            ),
            Node.create(
                Rank.of('sister'),
                Node.create(
                    Rank.of('neice'),
                ),
                Node.create(
                    Rank.of('nephew')
                )
            )
        ),
        Node.create(
            Rank.of('uncle')
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

                inDescendents: Node.create(Rank.of('grandson')),
                inChildren: Node.create(Rank.of('son')),
                inSiblings: Node.create(Rank.of('brother')),
                inParents: tree,
                inAncestors: Node.create(Rank.of('uncle')),

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
        expect(finder(Module)).toEqual(you.modules.at(0))
        expect(finder(Node.create())).toEqual(nil)
    })
    it('in modules, defaults to siblings', () => {
        const [,, you] = createFamilyTreeAndFinder()
        const youRank = you.get(0)
        const youRankFind = new Finder(youRank)
        expect(youRankFind(Module)).toEqual(youRank.siblings.at(0))

    })
})

it('require flag', () => {
    const [finder, tree, you] = createFamilyTreeAndFinder()
    expect(() => finder.require.inAncestors(Node.create(Module.for('cheese')))).toThrow('Could not find module')
    const root = finder.require.inAncestors(you.root)
    expect(root).toEqual(tree)
})

it('all flag', () => {
    const [ finder,,you ] = createFamilyTreeAndFinder()
    expect(finder.all.inParents(Module)).toEqual(you.parents)
})
