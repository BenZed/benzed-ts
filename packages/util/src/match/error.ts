
export class NoMatchError extends Error {

    constructor(
        protected value: unknown
    ) {
        super(`Could not find a match for ${value}`)
        this.name = 'NoMatchError'
    }
 
}

export class NoIterableValuesError extends Error {
    constructor( ) {
        super('No values provided to iterate.')
        this.name = 'NoValuesError'
    }

}

