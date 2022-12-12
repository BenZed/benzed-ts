import { Module } from '../module'

/* eslint-disable 
    @typescript-eslint/no-this-alias
*/
//// Types ////

type path = `/${string}`

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
        while (module.parent && module.parent !== ancestor) {
            const { parent } = module 

            const path: path = parent instanceof Path
                ? parent.getPath()
                : `/${parent.modules.indexOf(this)}`

            paths.push(path)
            module = module.parent
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