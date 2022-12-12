import { Module } from '../module'

/* eslint-disable 
    @typescript-eslint/no-this-alias
*/
//// Types ////

type path = `/${string}`

//// Main ////

class Path<P extends path> extends Module<P> {

    static create<Px extends path>(path: Px): Path<Px> {
        return new Path(path)
    }

    get path(): P {
        return this._state
    }

    getPath(): P {
        return this._state
    }

    getPathFrom(ancestor: Module): path {
        this.assert(ancestor, 'parents')

        const paths: path[] = [this.getPath()]
        let module: Path<path> | Module = this
        while (module.parent && module !== ancestor) {
            const { parent } = module 

            const path: path = parent instanceof Path
                ? parent.getPath()
                : `/${parent.modules.indexOf(this)}`

            paths.push(path)
            module = module.parent
        }

        return paths.reverse().join('/') as path
    }

    getPathFromRoot(): path {
        return this.getPathFrom(this.root)
    }

    private constructor(path: P) {
        super(path)
    }
    
}

//// Exports ////

export default Path

export {
    Path,
    path
}