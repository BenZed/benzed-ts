import { KeysOf, merge, OutputOf, Property } from '@benzed/util'

import { addMutators } from './mutator-operations'

import { AnyValidate } from '../../../validator'
import Schema, { SchemaValidate } from '../../schema'

//// Types ////

enum MutatorType {
    Optional,
    ReadOnly,
    Async
}

type AnyMutator = Mutator<AnyValidate, MutatorType, unknown>

type MutatorProperties<V extends AnyValidate> = {
    [K in Exclude<keyof V, KeysOf<Mutator<V, MutatorType>>>]: V[K]
}

// class Mutate<
//     V extends AnyValidate, 
//     T extends MutatorType, 
//     O = OutputOf<V>
// > extends Validate<unknown, O>{

//     static add<Vx extends AnyValidate, Tx extends MutatorType[]>(
//         validate: Vx, 
//         ...mutators: Tx
//     ): AddMutators<Vx, Tx> {
//         for (const mutator of mutators) {
//             switch (mutator) {
//                 case MutatorType.Optional: 
//                 // return new Optional(validate)
//                 case MutatorType.ReadOnly: 
//                 // return new ReadOnly(validate)
//                 case MutatorType.Async: {
//                     void validate
//                     throw new Error(`${MutatorType[mutator]} not yet implemented`)
//                     // return new Async(validate)
//                 }
//                 default: {
//                     const mutatorBad: never = mutator
//                     throw new Error(`${mutatorBad} is an invalid option.`)
//                 }
//             }
//         }
//         throw new Error('Must add at least one mutator')
//     }

//     static override apply<Vx extends AnyValidate, Tx extends MutatorType>(
//         validate: Vx, 
//         type: Tx
//     ): ApplyMutator<Vx,Tx> {
//         if (this.has(validate, type))
//             return validate as ApplyMutator<Vx,Tx>
//         return this.add(validate, type) as ApplyMutator<Vx,Tx>
//     }

//     static remove<Vx extends AnyValidate>(validate: Vx): RemoveAllMutators<Vx>
//     static remove<Vx extends AnyValidate, Tx extends MutatorType>(
//         validate: Vx,
//         mutator: Tx
//     ): RemoveMutator<Vx, Tx> 

//     static remove(
//         validate: AnyValidate, 
//         mutator?: MutatorType
//     ): unknown {

//         const allMutators = Array.from(this._each(validate))
//         if (!mutator) {
//             const validatorWithoutMutator = allMutators.at(-1)?._target ?? validate
//             return validatorWithoutMutator // RemoveAllMutators
//         }

//         if (!this.has(validate, mutator))
//             return validate

//         throw new Error('Not yet implememented') 
//     }

//     static of<Vx extends AnyValidate>(
//         validate: Vx
//     ): MutatorsOf<Vx> {
//         return Array.from(this._each(validate), i => i.mutator) as MutatorsOf<Vx>
//     }

//     /**
//      * @internal
//      */
//     static * _each(target: AnyValidate): IterableIterator<Mutate<AnyValidate, MutatorType>> {
//         while (target instanceof Mutate) {
//             yield target
//             target = target._target
//         }
//     }
// }

//// Implementation ////

class Mutator<V extends AnyValidate, T extends MutatorType, O = OutputOf<V>> extends Schema<O> {

    static add = addMutators

    constructor(
        readonly target: V,
        readonly mutator: T
    ) {
        super(target as SchemaValidate<O>)
        this._mutate()
    }

    //// ValueCopy ////

    override copy(): this {
        const clone = super.copy()
        clone._mutate()
        return clone
    }

    override get state(): Partial<this> {
        const {
            target,
            mutator,
        } = this

        return {
            target,
            mutator
        } as unknown as Partial<this>
    }

    protected override set state(value: Partial<this>) {
        const { target, mutator } = value as this
        merge(
            this, 
            {
                target, 
                mutator, 
            }
        )
    }

    //// Mutator ////

    private _mutate(): void {
        Property.define(this, this._createMutation())
    }

    protected _createMutation(): PropertyDescriptorMap {
        return {}
    }

}

//// Exports ////

export {
    AnyMutator,
    Mutator,
    MutatorType,
    MutatorProperties
}