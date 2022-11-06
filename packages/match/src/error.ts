
abstract class MatchError extends Error {

    constructor(message: string) {
        super(message)
    }
}

export class UnmatchedValueError extends MatchError {

    constructor(
        protected value: unknown
    ) {
        super(`Unmatched value: ${JSON.stringify(value)}`)
    }
 
}

export class NotMatchExpressionError extends MatchError {

    constructor() {
        super('Match is not iterable')
    }

}

export class MatchExpressionValueRequiredError extends MatchError {

    constructor() {
        super('Match expression requires at least one value')
    }

}

export class NoMultipleDefaultCasesError extends MatchError {

    constructor() {
        super('Match already has a default case')
    }

}
