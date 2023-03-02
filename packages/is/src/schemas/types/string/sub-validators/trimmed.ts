import { SubContractValidator } from '../../../../validators'

//// Exports ////

export class Trimmed extends SubContractValidator<string> {

    override transform(input: string): string {
        return input.trim()
    }

    override message() {
        return 'must be trimmed'
    }

}