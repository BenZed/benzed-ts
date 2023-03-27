import { Trait } from '@benzed/traits'
import { is } from '@benzed/is'
import { Node, FindInput } from '@benzed/node'
import { AnyTypeGuard } from '@benzed/util'

import Module from '../module'

//// Main ////

/**
 * Trait with helper methods to validate a module's position relative
 * to other modules in the app.
 */
abstract class Validateable extends Trait {

    static override readonly is: (input: unknown) => input is Validateable =
        is.shape({
            validate: is.function
        }).strict(false) as AnyTypeGuard

    /**
     * Validate a module's position in the tree.
     */
    validate(): void {
        this._onValidate()
    }

    /**
     * Called to validate a module's position in a tree. If the
     * onValidate method doesn't throw any errors, it's considered to be valid.
     */
    protected abstract _onValidate(): void

    /**
     * Throws if this module isn't the root
     */
    protected _assertRoot(): void {
        this._assertModule()
        if (Node.getRoot(this) !== this)
            throw new Error(`${this.name} must be the root module.`)
    }

    /**
     * Throws if this Module isn't parented to the root
     */
    protected _assertRootParent(): void {
        this._assertModule()
        if (Node.getRoot(this) !== Node.getParent(this))
            throw new Error(`${this.name} must be parented to the root.`)
    }

    /**
     * Throws if this module has a sibling of the same type
     */
    protected _assertUniqueSibling(): void {
        this._assertModule()
        if (Node.has(this).inSiblings(module => module instanceof this.constructor))
            throw new Error(`${this.name} must be the only child of it's type.`)
    }

    /**
     * Throws if there is another module in the tree of the same type
     */
    protected _assertUnique(): void {
        this._assertModule()
        if (Node.has(this).inNodes(module => module !== this && module instanceof this.constructor))
            throw new Error(`${this.name} must be the only module of it's type.`)
    }

    /**
     * Throws if required module is not found in siblings
     */
    protected _assertRequiredInSibling<T extends FindInput<Module>>(input: T): void {
        this._assertModule()
        if (!Node.has<Module>(this).inSiblings(input))
            throw new Error(`${this.name} is missing required module ${Module.nameOf(input)} in siblings`)
    }

    /**
     * Throws if required module is not found
     */
    protected _assertRequired<T extends FindInput<Module>>(input: T): void {
        this._assertModule()
        if (!Node.has<Module>(this).inNodes(input))
            throw new Error(`${this.name} is missing required module ${Module.nameOf(input)}`)
    }

    /**
     * Throws if conflicting module is found in siblings
     */
    protected _assertConflictingInSibling<T extends FindInput<Module>>(input: T): void {
        this._assertModule()
        if (Node.has<Module>(this).inSiblings(input))
            throw new Error(`${this.name} cannot be placed with conflicting module ${Module.nameOf(input)} in siblings`)
    }

    /**
     * Throws if conflicting module is found
     */
    protected _assertConflicting<T extends FindInput<Module>>(input: T): void {
        this._assertModule()
        if (Node.has<Module>(this).inNodes(input))
            throw new Error(`${this.name} cannot be placed with conflicting module ${Module.nameOf(input)}`)
    }

    //// Helper ////

    private _assertModule(): asserts this is Module {
        if (!is(Module)(this))
            throw new Error(`${Module.nameOf(this)} must be a ${Module.name}`)
    }
}

//// Exports ////

export default Validateable

export {
    Validateable
}
