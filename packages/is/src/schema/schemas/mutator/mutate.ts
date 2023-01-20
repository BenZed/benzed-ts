import { OutputOf, Pipe } from '@benzed/util'

import { AddMutator, AddMutators, ApplyMutator, HasMutator, MutatorsOf, MutatorType, RemoveAllMutators, RemoveMutator } from './mutator'
import { AnyValidate, Validate } from '../../../validator'
import Schema from '../../schema'
import { copy } from '@benzed/immutable/src'

//// Main ////

class Mutate<V extends AnyValidate, T extends MutatorType, O = OutputOf<V>> extends Validate<unknown, O>{

    static add<Vx extends AnyValidate, Tx extends MutatorType[]>(validate: Vx, ...mutators: Tx): AddMutators<Vx, Tx> {
        for (const mutator of mutators) {
            switch (mutator) {
                case MutatorType.Optional: 
                // return new Optional(validate)
        
                case MutatorType.ReadOnly: 
                // return new ReadOnly(validate)
            
                case MutatorType.Async: {
                    void validate
                    throw new Error(`${MutatorType[mutator]} not yet implemented`)
                // return new Async(validate)
                }

                default: {
                    const mutatorBad: never = mutator
                    throw new Error(`${mutatorBad} is an invalid option.`)
                }
            }
        }
        throw new Error('Must add at least one mutator')
    }

    static override apply<Vx extends AnyValidate, Tx extends MutatorType>(validate: Vx, type: Tx): ApplyMutator<Vx,Tx> {
        if (this.has(validate, type))
            return validate as ApplyMutator<Vx,Tx>

        return this.add(validate, type) as ApplyMutator<Vx,Tx>
    }

    static has<Vx extends AnyValidate, Tx extends MutatorType>(validate: Vx, type: Tx): HasMutator<Vx, Tx> {
        for (const mutator of this._each(validate)) {
            if (mutator.mutator === type)
                return true as HasMutator<Vx, Tx>
        } 
        return false as HasMutator<Vx, Tx>
    }

    static remove<Vx extends AnyValidate>(validate: Vx): RemoveAllMutators<Vx>
    static remove<Vx extends AnyValidate, Tx extends MutatorType>(
        validate: Vx,
        mutator: Tx
    ): RemoveMutator<Vx, Tx> 

    static remove(validate: AnyValidate, mutator?: MutatorType): unknown {

        if (!mutator)
            return Array.from(this._each(validate)).at(-1)?._validate ?? validate

        const index = this.of(validate).indexOf(mutator as never)
        if (index < 0)
            return validate

        return this._splice(validate, index, 1)
    }

    static of<Vx extends AnyValidate>(validate: Vx): MutatorsOf<Vx> {
        return Array.from(this._each(validate), i => i.mutator) as MutatorsOf<Vx>
    }

    static _splice<Vx extends AnyValidate>(
        validate: Vx,
        index: number,
        deleteCount: number,
        mutator?: Mutate<AnyValidate, MutatorType>
    ): AnyValidate {

        // const 
    }

    static * _each(validate: AnyValidate): IterableIterator<Mutate<AnyValidate, MutatorType>> {
        while (validate instanceof Mutate) {
            yield validate
            validate = validate._validate
        }
    }

    constructor(protected _validate: V, public mutator: T) {
        super(Schema.validate)
        this._validators = []
    }

    //// Validators ////
    
    get validate(): Validate<unknown, O> {
        return Pipe.from(this._validate).bind(this) as Validate<unknown, O>
    }

    private _validators: AnyValidate[]
    get validators(): AnyValidate[] {
        return [this._validate, ...this._validators]
    }

    //// State ////

    override get state(): Partial<this> {
        const { _validate, _validators, mutator } = this
        return { _validate, _validators, mutator } as unknown as Partial<this>
    }
    
    protected override set state(state: Partial<this>) {
        const { validators, mutator } = state as this
    
        const [ _validate, ..._validators ] = validators
    
        this._validate = _validate as V
        this._validators = _validators
        this.mutator = mutator
    }

}

//// Exports ////

export default Mutate

export {
    Mutate
}