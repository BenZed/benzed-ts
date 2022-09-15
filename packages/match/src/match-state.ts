import { Outputs } from './types'

/*** Types ***/

type MatchCase<I, O> = { input: I, output: O, $$ymbol: symbol | null }

/*** Main ***/

class MatchState<I, O extends Outputs> {

    public cases: MatchCase<I, O[number]>[] = []

    public finalized = false
    public valueYieldedAtLeastOnce = false

    private _iterator: Iterator<O[number]> | null = null
    public get iterator(): Iterator<O[number]> {
        const iterator = this._iterator ??= this._iterable[Symbol.iterator]()
        return iterator
    }

    public constructor (
        private readonly _iterable: Iterable<O[number]>
    ) { }

    public assertOutputCases(): void {
        // $$symbols prevent output
        if (this.cases.filter(c => !c.$$ymbol).length === 0)
            throw new Error('No output cases have been defined.')
    }

}

/*** Exports ***/

export default MatchState

export {
    MatchState
}