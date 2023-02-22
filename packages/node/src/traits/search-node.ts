
import { isIntersection, isObject, isShape } from '@benzed/util'

import { Node } from './node'
import { AssertNode, FindNode as FindNode, HasNode } from '../find'

//// Main ////

/**
 * A search node has properties on it relevant to finding other nodes.
 */
class SearchNode extends Node {

    static override is: (input: unknown) => input is SearchNode = isIntersection(
        Node.is,
        isShape({
            find: isObject<FindNode>,
            has: isObject<HasNode>,
            assert: isObject<AssertNode>,
        })
    )

    get find(): FindNode {
        return Node.find(this)
    }

    get has(): HasNode {
        return Node.has(this)
    }

    get assert(): AssertNode {
        return Node.assert(this)
    }

}

//// Exports ////

export default SearchNode

export {
    SearchNode
}