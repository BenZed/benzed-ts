
export class NoMatchError extends Error {

    constructor(
        protected value: unknown
    ) {
        super(`Unmatched value: ${value}`)
        this.name = 'NoMatchError'
    }
 
}

export class NotMatchExpressionError extends Error {

    constructor( ) {
        super('Match is not iterable')
        this.name = 'NotMatchExpressionError'
    }

}

