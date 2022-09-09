import { DuplexValidator } from './validator'

/*** Main ***/

class TrimValidator extends DuplexValidator<string> {

    /*** Construct with no settings ***/

    public constructor () {
        super({})
    }

    /*** DuplexValidator Implementation ***/

    protected transform(input: string): string {
        return input.trim()
    }

    protected assert(input: string): void {
        if (input !== this.transform(input))
            throw new Error('Cannot begin or end with any whitespace')
    }

}

/*** Exports ***/

export default TrimValidator

export {
    TrimValidator
}