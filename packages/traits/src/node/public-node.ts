import { Each, isArrayOf, isFunc, isIntersection, isNumber, isOptional, isShape, isString, isSymbol, isUnion, nil } from '@benzed/util'
import Node from './node'
import { NodePath } from './path'

//// Main ////

/**
 * Public node has exposed properties for manipulating 
 */
class PublicNode extends Node {

    static override is: (input: unknown) => input is PublicNode = 
        isIntersection(
            Node.is,
            isShape({
                name: isString,
                path: isArrayOf(isUnion(isString, isNumber, isSymbol)),
                root: Node.is,
                parent: isOptional(Node.is),
                children: isArrayOf(Node.is),
                eachChild: isFunc,
                eachParent: isFunc,
                eachSibling: isFunc,
                eachAncestor: isFunc,
                eachDescendent: isFunc,
                eachNode: isFunc,
            })
        )

    get name(): string {
        const name = Node.getPath(this).at(-1)
        return isString(name) 
            ? name 
            : this.constructor.name
    }

    get path(): NodePath {
        return Node.getPath(this )
    }

    get root(): Node {
        return Node.getRoot(this)
    }

    get parent(): Node | nil {
        return Node.getParent(this)
    }

    get children(): Node[] {
        return Array.from(this.eachChild())
    }

    eachChild(): Each<Node> {
        return Node.eachChild(this)
    }

    eachParent(): Each<Node> {
        return Node.eachParent(this)
    }

    eachSibling(): Each<Node> {
        return Node.eachSibling(this)
    }

    eachAncestor(): Each<Node> {
        return Node.eachAncestor(this)
    }

    eachDescendent(): Each<Node> {
        return Node.eachDescendent(this)
    }

    eachNode(): Each<Node> {
        return Node.eachNode(this)
    }
}

//// Exports ////

export default PublicNode

export {
    PublicNode
}