import IsInstance from './is-instance'

//// Exports ////

export class IsRegExp extends IsInstance<RegExpConstructor> {
    constructor() {
        super(RegExp)
    }
}

