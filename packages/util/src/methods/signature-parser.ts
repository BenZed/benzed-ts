import { Callable } from '../classes'

import { 
    Compile, 
    indexesOf, 
    isObject, 
    KeysOf, 
    Merge, 
    nil,
    TypeGuard
} from '../types'

//// Helper Types ////

type _RequiredValues<T> = {
    [K in KeysOf<T> as nil extends T[K] ? never : K]: T[K]
}

type _OptionalValues<T> = {
    [K in KeysOf<T> as nil extends T[K] ? K : never]?: T[K]
}

type _NilToOptional<T> = T extends [infer T1] 
    ? nil extends T1 ? [Exclude<T1, nil>?] : [T1]
    : Compile<_RequiredValues<T> & _OptionalValues<T>>

type _EveryValueIsOptional<T> = keyof _RequiredValues<T> extends never
    ? true 
    : false

type _LayoutToSignature<T extends GenericObject, L extends Layout<T>> =
    L extends [infer L1, ...infer Lr]
        ? L1 extends KeysOf<T> 
            ? Lr extends Layout<T> 
                ? [..._NilToOptional<[T[L1]]>, ..._LayoutToSignature<T, Lr>]
                : [..._NilToOptional<[T[L1]]>]
            : []
        : []

//// Types ////

type GenericObject = Record<string, unknown> 

type Result<T extends GenericObject, D extends Partial<Defaults<T>>> =
    Merge<[T,D]> extends infer O
        ? _EveryValueIsOptional<O> extends true
            ? _NilToOptional<O> | nil
            : _NilToOptional<O>
        : never

type Types<T extends GenericObject> = {
    [K in keyof T]: TypeGuard<T[K]>
}

type Layout<T extends GenericObject> = KeysOf<T>[]

type Defaults<T extends GenericObject> = _OptionalValues<T>

type Signature<T extends GenericObject, L extends Layout<T>[]> =
    L extends [infer L1, ...infer Lr]
        ? L1 extends Layout<T> 
            ? Lr extends Layout<T>[]
                ? _LayoutToSignature<T, L1> | Signature<T, Lr>
                : _LayoutToSignature<T, L1>
            : [_NilToOptional<T>]
        : [_NilToOptional<T>]

//// Class ////

class SignatureParser<
    T extends GenericObject, 
    D extends Partial<Defaults<T>>,
    L extends Layout<T>[] = []
>
    extends Callable<(signature: Signature<T,L>) => Result<T, D>> {

    constructor(
        readonly types: Types<T>, 
        readonly defaults: D = {} as D, 
        readonly layouts: L = [] as unknown as L
    ) {
        super((signature): Result<T, D> => {

            const output = this._parseEachLayout(signature) ?? signature[0][0] ?? {}
            //                                           if no layouts matched,    ^
            //                                           the first arg may be an 
            //                                           result object itself

            const outputWithDefaults = isObject(output)
                ? { ...this.defaults, ...output }
                : { ...this.defaults }

            if (this.isResult(outputWithDefaults))
                return outputWithDefaults

            throw new Error(`Signature not recognized: ${signature}`)
        })
    }

    isResult(input: unknown): input is Result<T, D> {
        return isObject(input) && Object
            .entries(input)
            .every(([key, value]) => this.types[key](value))
    }

    setDefaults<Dx extends Partial<Defaults<T>>>(defaults: Dx): SignatureParser<T,Dx,L> {
        return new SignatureParser(this.types, defaults, this.layouts)
    }

    addLayout<Lx extends Layout<T>>(...layout: Lx): SignatureParser<T, D, [...L, Lx]> {
        return new SignatureParser(this.types, this.defaults, [...this.layouts, layout])
    }

    // Helper 

    private _parseEachLayout(args: unknown[]): Result<T, D> | nil {
        for (const layout of this.layouts) {
            const layoutMatch = layout.every((key, i) => this.types[key](args[i]))
            if (!layoutMatch)
                continue

            const output: GenericObject = {}

            for (const index of indexesOf(layout)) {
                const key = layout[index]
                if (args[index] !== nil)
                    output[key] = args[index]
            }
            return output as Result<T, D>
        }

        return nil
    }
}

//// Exports ////

export default SignatureParser

export {
    SignatureParser,
    Signature,
    Defaults as SigantureDefaults,
    Types as SignatureTypes,
    Layout as SignatureLayout,
}