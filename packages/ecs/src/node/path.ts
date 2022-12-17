import { $$equals } from '@benzed/immutable'
import { isString, KeysOf } from '@benzed/util'

import { Module, ModuleArray } from '../module'
import { Modules } from '../modules'

/* eslint-disable 
    @typescript-eslint/no-this-alias,
    @typescript-eslint/ban-types
*/
//// Helper Types ////

type _PathOf<M extends ModuleArray> = M extends [infer Mx, ...infer Mr]
    ? Mx extends Path<infer P> 
        ? P
        : Mr extends ModuleArray
            ? _PathOf<Mr>
            : unknown
    : unknown

type _NodeAtPath<N, P extends string, R extends boolean> = N extends Modules<infer Mx> 
    ? _PathOf<Mx> extends path 
        ? { [K in `${P}${_PathOf<Mx>}`]: N } & 
        (R extends true ? _NodesAtPath<Mx, `${P}${_PathOf<Mx>}`, true> : {})
        
        : {}
    : {}

type _NodesAtPath<M, P extends string, R extends boolean> = M extends [infer Sx, ...infer Sr] 
    ? Sr extends ModuleArray
        ? _NodeAtPath<Sx, P, R> & _NodesAtPath<Sr, P, R>
        : _NodeAtPath<Sx, P, R>
    : {}

//// Path Type ////
    
type path = `/${string}`

//// Path Inference Types ////

type NestedPathsOf<M extends ModuleArray> = KeysOf<_NodesAtPath<M, '', true>>

type ToPath<P extends string> = P extends path ? P : `/${P}`

type PathsOf<M extends ModuleArray> = KeysOf<_NodesAtPath<M, '', false>>

type GetNodeAtNestedPath<M extends ModuleArray, P extends NestedPathsOf<M>> = _NodesAtPath<M, '', true>[P]

type GetNodeAtPath<M extends ModuleArray, P extends PathsOf<M>> = _NodesAtPath<M, '', false>[P]

//// Main ////

class Path<P extends path = path> extends Module<P> {

    static validate<P extends path>(path: P): P {

        // '/lower-dash-case-with-digits-000'
        if (!path
            .split('')
            .every((char, i) => i === 0 ? char === '/' : /[a-z]|\d|-/.test(char))
        )
            throw new Error(`${path} is not a valid path.`)
    
        return path
    }

    static is(input: unknown): input is path {
        if (!isString(input))
            return false 

        try {
            Path.validate(input as path)
            return true
        } catch {
            return false
        }
    }

    static create<Px extends path>(path: Px): Path<Px> {
        return new Path(path)
    }

    constructor(path: P) {
        super(Path.validate(path))
    }

    get path(): P {
        return this.state
    }

    getPath(): P {
        return this.path
    }

    getPathFrom(ancestor: Module): path {
        this.assert('Must get path from a direct ancestor')
            .inParents(ancestor)
        
        const paths: path[] = []

        for (const parent of this.eachParent()) {

            const path = parent.find(Path)?.path
            if (!path && parent !== this.root)
                throw new Error(`Every ancestor except the root must have a ${this.name} module.`)

            if (parent[$$equals](ancestor))
                break

            if (path)
                paths.push(path)
        }

        return paths.reverse().join('') as path
    }
 
    getPathFromRoot(): path {
        return this.getPathFrom(this.root)
    }

    //// Validation ////
    
    override validate(): void {
        Modules.assert.isSingle(this)

        // should assert
        void this.getPathFromRoot()
    }
  
}

//// Exports ////

export default Path

export {
    path,
    Path,
    PathsOf,
    ToPath,
    NestedPathsOf,
    GetNodeAtPath,
    GetNodeAtNestedPath
}