
import { isIntersection, isObject, isShape } from '@benzed/util'

import { Node, AssertNode, FindNode as FindNode, HasNode } from './node'

//// Main ////

/**
 * A search node has properties on it relevant to finding other nodes.
 */
class SearchNode extends Node {

    static override is: (input: unknown) => input is SearchNode = isIntersection(
        Node.is,
        isShape({
            find: isObject<FindNode<Node>>,
            has: isObject<HasNode<Node>>,
            assert: isObject<AssertNode<Node>>,
        })
    )

    get find(): FindNode<Node> {
        return Node.find(this)
    }

    get has(): HasNode<Node> {
        return Node.has(this)
    }

    get assert(): AssertNode<Node> {
        return Node.assert(this)
    }

}

//// Exports ////

export default SearchNode

export {
    SearchNode
}