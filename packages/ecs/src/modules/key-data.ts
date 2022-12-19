import { equals } from '@benzed/immutable'
import { IsIdentical } from '@benzed/util'

import { Module, ModuleArray } from '../module'
import Modules from './modules'

//// Another Helper Class ////

type _GetKeyData<M, K> = M extends [infer M1, ...infer Mr ]
    ? M1 extends KeyData<infer Kx, infer T> 
        ? IsIdentical<K, Kx> extends true 
            ? T
            : _GetKeyData<Mr, K>
        : _GetKeyData<Mr, K>
    : never 

export type GetData<M, K> = M extends ModuleArray
    ? _GetKeyData<M, K>
    : M extends Modules<infer Mm> 
        ? _GetKeyData<Mm, K>
        : never

export class KeyData<K, T> extends Module<T> {

    constructor(readonly key: K, data: T) {
        super(data)
    }

    getData<M extends Modules>(this: M, key: K): GetData<M, K> {
        return this
            .parent
            .assert(`No state with key ${key}`)
            .inChildren((m): m is KeyData<K, GetData<M, K>> => m instanceof KeyData && equals(m.key, key))
            .data
    }

}
