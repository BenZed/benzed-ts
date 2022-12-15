import { KeysOf } from '@benzed/util'

import { Module, ModuleArray, Modules, ModulesInterface } from '../module'

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

export type NestedPathsOf<M extends ModuleArray> = KeysOf<_ModulesAtPath<M, '', true>>

export type PathsOf<M extends ModuleArray> = KeysOf<_ModulesAtPath<M, '', false>>

export type ModuleAtNestedPath<M extends ModuleArray, P extends NestedPathsOf<M>> = _ModulesAtPath<M, '', true>[P]

export type ModuleAtPath<M extends ModuleArray, P extends PathsOf<M>> = _ModulesAtPath<M, '', false>[P]

//// Main ////

class Path<P extends path> extends Module<P> {

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
        return this.state
    }

    getPathFrom(ancestor: Module): path {
        this.assert(ancestor, 'parents')

        const paths: path[] = [this.getPath()]

        let module: Path<path> | Module = this
        while (module.parent) {

            const parent = module.parent as ModulesInterface<Modules<[Path<path>]>, [Path<path>]>

            const path: path = parent.has(Path<path>, 'siblings')
                ? parent.find(Path<path>, 'siblings', true)[0].getPath()
                : `/${parent.parent?.modules.indexOf(parent) ?? 0}`

            module = module.parent
            if (module?.parent === ancestor) // ensure relative
                break 

            paths.push(path)
        }

        return paths.reverse().join('') as path
    }

    getPathFromRoot(): path {
        return this.getPathFrom(this.root)
    }
}

//// Exports ////

export default Path

export {
    Path,
    path
}