import Component from './component'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Main ***/

/**
 * ComputeComponents have ref picking logic that is decoupled from their input > output logic
 */
abstract class ComputeComponent<
    I,
    O,
    R extends Component<O, any, any> = Component<O, any, any>
> extends Component<I,O,R>{

    protected abstract _compute(input: I): O

    protected abstract _transfer(refs: R[], io: { input: I, output: O }): R | null 

    public execute(
        input: I,
        refs: R[]
    ): {
            output: O
            next: R | null
        } {

        const output = this._compute(input)
     
        return {
            output,
            next: this._transfer(refs, { input, output })
        }
    }

}

/*** Exports ***/

export default ComputeComponent

export {
    ComputeComponent
}