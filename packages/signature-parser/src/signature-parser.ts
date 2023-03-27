import { 
    NamesOf, 
    eachIndex,
    Compile, 
    GenericObject, 
    isRecord, 
    Merge, 
    nil,
    TypeGuard
} from '@benzed/util'

import {
    Method
} from '@benzed/traits'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

type _RequiredValues<T> = {
    [K in NamesOf<T> as nil extends T[K] ? never : K]: T[K]
}

type _OptionalValues<T> = {
    [K in NamesOf<T> as nil extends T[K] ? K : never]?: T[K]
}

type _NilToOptional<T> = T extends [infer T1] 
    ? nil extends T1 ? [T1?] : [T1]
    : Compile<_RequiredValues<T> & _OptionalValues<T>>

type _EveryValueIsOptional<T> = keyof _RequiredValues<T> extends never
    ? true 
    : false

type _LayoutToSignature<T extends GenericObject, L extends Layout<T>> =
    L extends [infer L1, ...infer Lr]
        ? L1 extends NamesOf<T> 
            ? Lr extends Layout<T> 
                ? [..._NilToOptional<[T[L1]]>, ..._LayoutToSignature<T, Lr>]
                : [..._NilToOptional<[T[L1]]>]
            : []
        : []

//// Types ////

type Result<T extends GenericObject, D extends Partial<T>> =
    Merge<[T,D]> extends infer O
        ? _EveryValueIsOptional<O> extends true
            ? _NilToOptional<O> | nil
            : _NilToOptional<O>
        : never

type Types<T extends GenericObject> = {
    [K in keyof T]: TypeGuard<T[K]>
}

type Layout<T extends GenericObject> = NamesOf<T>[]

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
    D extends Partial<T>,
    L extends Layout<T>[] = []
>
    extends Method<(...signature: Signature<T,L>) => Result<T, D>> {

    static merge<P extends AnySignatureParser[]>(...parsers: P): MergedSignatureParser<P> {
        return new MergedSignatureParser(...parsers)
    }

    constructor(
        readonly types: Types<T>,
        readonly defaults: D = {} as D,
        readonly layouts: L = [] as unknown as L
    ) {
        super((...signature): Result<T, D> => {
            const output = this._parseEachLayout(signature) ?? signature[0] ?? {}
            //                                       if no layouts matched,    ^
            //                                       the first arg may be an 
            //                                       result object itself

            const outputWithDefaults = isRecord(output)
                ? { ...this.defaults, ...output }
                : nil

            if (this.isResult(outputWithDefaults))
                return outputWithDefaults
    
            throw new Error(
                `Signature not recognized: ${JSON.stringify(signature)}`
            )
        })
    }

    //// Builder Pattern ////
    
    setDefaults<Dx extends Partial<T>>(defaults: Dx): SignatureParser<T,Dx,L> {
        return new SignatureParser(this.types, defaults, this.layouts)
    }

    addLayout<Lx extends Layout<T>>(...layout: Lx): SignatureParser<T, D, [...L, Lx]> {
        return new SignatureParser(this.types, this.defaults, [...this.layouts, layout])
    }

    //// Convenience Methods ////
    
    isSignature(input: unknown[]): input is Signature<T,L> {
        return (
            !!this._parseEachLayout(input as Signature<T,L>) ||
            isRecord(input[0]) && this.isResult({ ...this.defaults, ...input[0] })
        )
    }

    isResult(input: unknown): input is Result<T, D> {
        return isRecord(input) && Object
            .entries(input)
            .every(([key, value]) => key in this.types && this.types[key](value))
    }

    // Helper 

    private _parseEachLayout(signature: unknown[]): Result<T, D> | nil {
        for (const layout of this.layouts) {
            const layoutMatch = layout.every((key, i) => this.types[key](signature[i]))
            if (!layoutMatch)
                continue

            const output: GenericObject = {}

            for (const index of eachIndex(layout)) {
                const key = layout[index]
                if (signature[index] !== nil)
                    output[key] = signature[index]
            }
            return output as Result<T, D>
        }

        return nil
    }
}

//// Merged Signature Parser////

type AnySignatureParser = SignatureParser<any,any,any>

type Signatures<P extends AnySignatureParser> = P extends SignatureParser<infer T, any, infer L> 
    ? Signature<T, L>
    : never 

type Results<P extends AnySignatureParser> = 
    P extends SignatureParser<infer T, infer D, any> 
        ? Result<T, D>
        : never 

class MergedSignatureParser<P extends AnySignatureParser[]>

    extends Method<(...signature: Signatures<P[number]>) => Results<P[number]>>{

    readonly parsers: P 

    constructor(...parsers: P) {
        super((...signature): Results<P[number]> => {
            for (const parser of this.parsers) {
                if (parser.isSignature(signature))
                    return parser(...signature) as Results<P[number]>
            }
            console.error(signature)
            throw new Error(`Signature not recognized: ${JSON.stringify(signature)}`)
        })
        this.parsers = parsers
    }

    isSignature(input: unknown[]): input is Signatures<P[number]> {
        return this.parsers.some(p => p.isSignature(input))
    }

    isResult(input: unknown): input is Results<P[number]> {
        return this.parsers.some(p => p.isResult(input))
    }

}

//// Exports ////

export default SignatureParser

export {
    SignatureParser,
    Signature,
    Defaults as SignatureParserDefaults,
    Types as SignatureParserTypes,
    Layout as SignatureParserLayout,
    Result as SignatureParserResult,

    MergedSignatureParser,
    Signatures,
    Results as SignatureParserResults
}