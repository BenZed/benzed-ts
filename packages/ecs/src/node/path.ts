import { KeysOf } from '@benzed/util'

import { Module, ModuleArray, Modules } from '../module'

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

type _ModuleAtPath<M, P extends string, R extends boolean> = M extends Modules<infer Mx> 
    ? _PathOf<Mx> extends path 
        ? { [K in `${P}${_PathOf<Mx>}`]: M } & 
        (R extends true ? _ModulesAtPath<Mx, `${P}${_PathOf<Mx>}`, true> : {})
        
        : {}
    : {}

type _ModulesAtPath<M, P extends string, R extends boolean> = M extends [infer Sx, ...infer Sr] 
    ? Sr extends ModuleArray
        ? _ModuleAtPath<Sx, P, R> & _ModulesAtPath<Sr, P, R>
        : _ModuleAtPath<Sx, P, R>
    : {}

//// Path Type ////
    
type path = `/${string}`

//// Path Inference Types ////

type NestedPathsOf<M extends ModuleArray> = KeysOf<_ModulesAtPath<M, '', true>>

type PathsOf<M extends ModuleArray> = KeysOf<_ModulesAtPath<M, '', false>>

type ModuleAtNestedPath<M extends ModuleArray, P extends NestedPathsOf<M>> = _ModulesAtPath<M, '', true>[P]

type ModuleAtPath<M extends ModuleArray, P extends PathsOf<M>> = _ModulesAtPath<M, '', false>[P]

//// Main ////

class Path<P extends path = path> extends Module<P> {

    static validate<P extends path>(path: P): P {

        // '/lower-dash-case-with-digits-000'
        if (!path
            .split('')
            .every((char, i) => i === 0 ? char === '/' : /[a-z]|\d|-/.test(char))
        )
            throw new Error(`${path} is an invalid path.`)
    
        return path
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
        this.assert(ancestor, 'parents')
        
        const paths: path[] = [this.path]

        let parent = this.parent
        while (parent && parent.parent !== ancestor && parent !== ancestor) {

            const path = parent?.find(Path).at(0)
            if (!path && parent !== this.root)
                throw new Error('Every ancestor except the root must have a Path module')
            
            if (path)
                paths.push(path.path)

            parent = parent.parent

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
    NestedPathsOf,
    ModuleAtPath,
    ModuleAtNestedPath
}