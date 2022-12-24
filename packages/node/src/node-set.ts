import Node from './node'

//// Types ////

export type NodeArray = readonly Node[]

export const isNodeArray = (input: unknown): input is NodeArray => {
    return Array.isArray(input) && input.length > 0 && input.every(Node.isNode)
}

//// Main ////

export class NodeSet<T extends NodeArray> extends Node<T> {

    constructor(...set: T) {
        super(set)
    }

    /**
     * TODO: add all the array operations here
     * Add all the
     */

}