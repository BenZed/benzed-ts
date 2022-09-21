import { matchCheck, resolveOutput } from './util'

/*** Types ***/

interface MatchCase<I, O> {
    input: I
    output: O
    operation: 'fall' | 'discard' | 'output'
}

interface AddMatchCaseOptions<I, O> extends Omit<MatchCase<I, O>, 'operation'> {
    operation?: MatchCase<I, O>['operation']
    finalize?: boolean
}

/*** Main ***/

class MatchState<I, O> {

    private readonly _cases: MatchCase<I, O>[] = []

    private _finalized = false
    public get finalized(): boolean {
        return this._finalized
    }

    public assertOutputCases(): void {
        if (this._cases.filter(c => c.operation === 'output').length === 0)
            throw new Error('No output cases have been defined.')
    }

    public assertFinalized(
        finalized = true,
        msg = `Cases have ${finalized ? 'not been' : 'been'} finalized.`
    ): void {
        if (this._finalized !== finalized)
            throw new Error(msg)
    }

    public addCase(options: AddMatchCaseOptions<I, O>): null {
        const { input, output, operation = 'output', finalize = false } = options

        this.assertFinalized(false, 'No more cases may be defined.')

        this._cases.push({ input, output, operation })

        if (finalize)
            this.finalize()

        return null
    }

    public finalize(): void {
        this.assertFinalized(false, 'Cases are already finalized.')
        this._finalized = true
    }

    public match(initial: I | O): { output: O } | null {

        let discarded = false
        let shouldYield = false

        let value = initial

        // check value against all cases
        for (const { input, output, operation } of this._cases) {

            const discard = operation === 'discard'
            const fall = operation === 'fall'

            const isMatch = matchCheck(input, value)
            if (isMatch && !discard)
                value = resolveOutput(output, value)

            if (isMatch && discard)
                discarded = true

            // send output
            if (isMatch && !discard && !fall)
                shouldYield = true

            if (isMatch && !fall)
                break
        }

        // unless discarded, every value needs a match
        if (!shouldYield && !discarded)
            throw new Error(`No match for value: ${initial}.`)

        return shouldYield ? { output: value as O } : null
    }

    public *[Symbol.iterator](): Generator<O> {
        throw new Error('No values to match.')
    }
}

class MatchIterableState<I, O> extends MatchState<I, O> implements Iterable<O>{

    // State 

    private _atLeastOneSuccess = false

    private _iterator: Iterator<I | O> | null = null
    public get iterator(): Iterator<I | O> {
        const iterator = this._iterator ??= this._iterable[Symbol.iterator]()
        return iterator
    }

    // Constructor

    public constructor (
        private readonly _iterable: Iterable<I>
    ) {
        super()
        this[Symbol.iterator] = this[Symbol.iterator].bind(this)
    }

    // This is where the magic happens

    public override *[Symbol.iterator](): Generator<O> {

        this.assertOutputCases()

        let result = this.iterator.next()
        if (result.done) {
            throw new Error(
                this._atLeastOneSuccess
                    ? 'All values matched.'
                    : 'No values to match.'
            )
        }

        // get values
        while (!result.done) {

            const success = this.match(result.value)
            if (success) {
                this._atLeastOneSuccess = true
                yield success.output
            }

            result = this.iterator.next()
        }

        // discard check
        if (!this._atLeastOneSuccess)
            throw new Error('All values discarded.')
    }

}

/*** Exports ***/

export default MatchIterableState

export {

    MatchState,
    MatchIterableState,

    MatchCase,
    AddMatchCaseOptions,
}