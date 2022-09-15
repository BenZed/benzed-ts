import { Outputs } from './types'
import { matchCheck, resolveOutput } from './util'

/*** Types ***/

interface MatchCase<I, O extends Outputs> {
    input: I
    output: O[number]
    operation: 'fall' | 'discard' | 'output'
}

interface AddMatchCaseOptions<I, O extends Outputs> extends Omit<MatchCase<I, O>, 'operation'> {
    operation?: MatchCase<I, O>['operation']
    finalize?: boolean
}

/*** Main ***/

class MatchState<I, O extends Outputs> implements Iterable<O[number]> {

    // State 

    public cases: MatchCase<I, O>[] = []

    public finalized = false
    public valueYieldedAtLeastOnce = false

    private _iterator: Iterator<O[number]> | null = null
    public get iterator(): Iterator<O[number]> {
        const iterator = this._iterator ??= this._iterable[Symbol.iterator]()
        return iterator
    }

    // Constructor ()

    public constructor (
        private readonly _iterable: Iterable<O[number]>
    ) {
        this[Symbol.iterator] = this[Symbol.iterator].bind(this)
    }

    // Interface

    public assertOutputCases(): void {
        if (this.cases.filter(c => c.operation === 'output').length === 0)
            throw new Error('No output cases have been defined.')
    }

    public addMatchCase(options: AddMatchCaseOptions<I, O>): undefined {
        const { input, output, operation = 'output', finalize = false } = options

        // check for final cases
        if (this.finalized)
            throw new Error('No more cases may be defined.')

        this.cases.push({ input, output, operation })
        this.finalized = finalize

        return undefined
    }

    // This is where the magic happens

    public *[Symbol.iterator](): Generator<O[number]> {

        this.assertOutputCases()

        let result = this.iterator.next()
        if (result.done) {
            throw new Error(
                this.valueYieldedAtLeastOnce
                    ? 'All values matched.'
                    : 'No values to match.'
            )
        }

        // get values
        while (!result.done) {

            let { value } = result
            let valueYielded = false
            let valueDiscarded = false

            // check value against all cases
            for (const { input, output, operation } of this.cases) {

                const discard = operation === 'discard'
                const fall = operation === 'fall'

                const isMatch = matchCheck(input, value)
                if (isMatch && !discard)
                    value = resolveOutput(output, value)

                if (isMatch && discard)
                    valueDiscarded = true

                // send output
                if (isMatch && !discard && !fall) {
                    valueYielded = true
                    this.valueYieldedAtLeastOnce = true
                    yield value as unknown as I
                }

                if (isMatch && !fall)
                    break
            }

            // unless discarded, every value needs a match
            if (!valueYielded && !valueDiscarded)
                throw new Error(`No match for value: ${value}.`)

            result = this.iterator.next()
        }

        // discard check
        if (!this.valueYieldedAtLeastOnce)
            throw new Error('All values discarded.')

    }

}

/*** Exports ***/

export default MatchState

export {
    MatchState,
    MatchCase,
    AddMatchCaseOptions
}