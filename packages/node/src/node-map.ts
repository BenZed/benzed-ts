import { isEmpty, isRecord } from '@benzed/util'
import Node from './node'

//// Types ////

export type NodeRecord = { [key: string]: Node }

export const isNodeRecord = (input: unknown): input is NodeRecord => 
    isRecord(input, Node.isNode) && !isEmpty(input)

//// Main ////

export class NodeMap<T extends NodeRecord> extends Node<T> {

    constructor(map: T) {
        super(map)
    }

    /**
     * TODO: add all the map operations here
     */

}