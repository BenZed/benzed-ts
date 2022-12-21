import { Indexes, IndexesOf, isTruthy as isNotEmpty, nil } from '@benzed/util'

import { Node } from '../node'

import State, { ModuleArray } from '../module/module'
import Modules, { 
    AddModules, 
    RemoveModule, 
    SetModule 
} from '../modules'

import { 
    addModules, 
    removeModule, 
    spliceModules
} from '../modules/operations'

import { 
    path, 
    Path, 
    GetNodeAtPath,
    PathsOf, 
    NestedPathsOf, 
    GetNodeAtNestedPath, 
    ToPath 
} from '../modules/path'

//// Helper ////

type IndexOfModuleAtPath<
    M extends ModuleArray, 
    P extends path, 
    I = Indexes<M>
> = I extends [infer Ix, ...infer Ir]
    ? Ix extends IndexesOf<M> 
        ? _ResolveModulePath<M[Ix]> extends P
            ? Ix
            : IndexOfModuleAtPath<M, P, Ir>
        : IndexOfModuleAtPath<M, P, Ir>
    : unknown

type _ResolveModuleArrayPath<M> = M extends [infer Mx, ...infer Mr]
    ? Mx extends Path<infer P> 
        ? P
        : _ResolveModuleArrayPath<Mr>
    : unknown

type _ResolveModulePath<M extends State> = M extends Modules<infer Mx> 
    ? _ResolveModuleArrayPath<Mx>
    : unknown

type _RemovePath<M> = M extends [infer Mx, ...infer Mr]
    ? Mx extends Path<path>
        ? _RemovePath<Mr>
        : [Mx, ..._RemovePath<Mr>]
    : []

type _EnsurePath<M extends Modules, P extends path> = M extends Modules<infer Mx> 
    ? _ResolveModuleArrayPath<Mx> extends P 
        ? M
        : Node<[Path<P>, ..._RemovePath<Mx>]>
    : never 

//// SetModuleAtPath ////

export type SetNodeAtPath<
    M extends ModuleArray, 
    P extends path, 
    Mx extends Modules
> = IndexOfModuleAtPath<M, P> extends IndexesOf<M> 
    ? SetModule<M, IndexOfModuleAtPath<M,P>, _EnsurePath<Mx, P>>
    : AddModules<M, [_EnsurePath<Mx,P>]>

export function setNodeAtPath<
    M extends ModuleArray, 
    P extends path, 
    Mx extends Modules
>(
    modules: M,
    path: P,
    module: Mx
): SetNodeAtPath<M,P,Mx>

export function setNodeAtPath<
    M extends ModuleArray, 
    P extends PathsOf<M>, 
    F extends (input: GetNodeAtPath<M,P>) => Modules
>(
    modules: M,
    path: P,
    module: F
): SetNodeAtPath<M, ToPath<P>,ReturnType<F>>

export function setNodeAtPath(
    modules: ModuleArray,
    path: path,
    input: Modules | ((input: State) => Modules)
): ModuleArray {

    const inputNode = 'parent' in input 
        ? input
        : input(
            getNodeAtPath(modules, path as never)
        )

    const newPath = new Path(path)

    const outputNode = Node.from(
        newPath,  
        ...inputNode
            .find
            .all(m => m instanceof Path ? nil : m) // remove existing paths
    )

    const replaceIndex = modules.findIndex(module => module.has.inChildren(newPath))
    return replaceIndex < 0
        ? addModules(modules, outputNode)
        : spliceModules(modules, replaceIndex, 1, outputNode)
}

//// RemoveModuleAtPath ////

export type RemoveNodeAtPath<
    M extends ModuleArray,
    P extends PathsOf<M>
> = IndexOfModuleAtPath<M, ToPath<P>> extends IndexesOf<M> 
    ? RemoveModule<M, IndexOfModuleAtPath<M, ToPath<P>>>
    : never

export function removeNodeAtPath<
    M extends ModuleArray, 
    P extends PathsOf<M> 
>(  
    modules: M,
    path: P
): RemoveNodeAtPath<M,P> {

    const keyPath = new Path(path as path)
    
    const index = modules.findIndex(node => node.find.inChildren(keyPath))
    if (index < 0)
        throw new Error(`Invalid path: ${path}`)

    const removed = removeModule(modules, index as IndexesOf<M>)
    return removed as ModuleArray as RemoveNodeAtPath<M,P>
}

//// GetNodeAtPath ////

export function getNodeAtPath<M extends ModuleArray, P extends NestedPathsOf<M>>(
    modules: M, 
    path: P
): GetNodeAtNestedPath<M,P>
export function getNodeAtPath(
    modules: ModuleArray, 
    nestedPath: path
): Modules {
    
    const paths = nestedPath
        .split('/')
        .filter(isNotEmpty)
        .map(path => new Path(`/${path}`))

    let output: Modules | nil
    for (const path of paths) {

        output = modules.find(module => module
            .find
            .inChildren(path)
        ) as Modules | nil
        if (!output)
            break

        modules = output.modules
    }

    if (!output)
        throw new Error(`Invalid path: ${nestedPath}`)

    return output
}

