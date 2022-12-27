import { equals } from '@benzed/immutable'
import { IsIdentical } from '@benzed/util'

import { Module, Modules } from '../module'
import type { Node, Nodes } from '../node'

//// Another Helper Class ////

type _GetKeyData<M, K> = M extends [infer M1, ...infer Mr ]
    ? M1 extends KeyData<infer Kx, infer T> 
        ? IsIdentical<K, Kx> extends true 
            ? T
            : _GetKeyData<Mr, K>
        : _GetKeyData<Mr, K>
    : never 

type _GetKeys<M> = M extends [infer M1, ...infer Mr]
    ? M1 extends KeyData<infer Kx, unknown> 
        ? [Kx, ..._GetKeys<Mr>]
        : _GetKeys<Mr>
    : []

export type GetKeys<M extends { data: Modules }> = M extends { data: infer Mx } 
    ? _GetKeys<Mx>[number]
    : never

export type GetData<M, K> = M extends Modules
    ? _GetKeyData<M, K>
    : M extends Node<infer Mm, Nodes>
        ? _GetKeyData<Mm, K>
        : never

export class KeyData<K, D> extends Module<D> {

    constructor(readonly key: K, data: D) {
        super(data)
    }

    setData<Dx>(data: Dx): KeyData<K, Dx> {
        return new KeyData(this.key, data)
    }
    
    // signature for parent
    getData<M extends { data: Modules }>(this: M, key: GetKeys<M>): GetData<M, K> 
    
    // signature fors module
    getData<T extends { key: K }>(this: T): T
    getData<T extends { key: K }>(this: T, key: K): T

    getData(...args: unknown[]): unknown {

        const [key] = args 

        const data = !key || key === this.key 
            ? this.data
            : this
                .node
                .assertModule(`No data for key ${key}`)
                ((m): m is KeyData<K, D> => 
                    m instanceof KeyData && equals(m.key, key)
                )

        return data
    }
}
