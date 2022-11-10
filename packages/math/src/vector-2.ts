import lerp from './lerp'

import { $$copy, $$equals } from '@benzed/immutable'
import { isArray, isArrayOfNumber, isObject, isString } from '@benzed/is'

import { cos, sin, sqrt, atan2 } from './overrides'
import { PI } from './constants'

//// Types ////

type V2String = `${number},${number}`

type V2Json = { x: number, y: number }

type V2Signature = Partial<V2Json> | V2String | [number, number]

type V2ConstructorSignature = [V2Signature] | [number, number] | [number] | []

//// Main ////

class V2 {

    static get ZERO(): V2 {
        return new V2(0, 0)
    }

    static get UP(): V2 {
        return new V2(0, 1)
    }

    static get RIGHT(): V2 {
        return new V2(1, 0)
    }

    static get DOWN(): V2 {
        return new V2(0, -1)
    }

    static get LEFT(): V2 {
        return new V2(-1, 0)
    }

    static lerp(a: V2Signature, b: V2Signature, delta = 0): V2 {

        const av2 = V2.from(a)
        const bv2 = V2.from(b)

        const x = lerp(av2.x, bv2.x, delta)
        const y = lerp(av2.y, bv2.y, delta)

        return new V2(x, y)
    }

    static distance(a: V2Signature, b: V2Signature): number {
        return sqrt(this.sqrDistance(a, b))
    }

    static sqrDistance(a: V2Signature, b: V2Signature): number {
        return new V2(a).sub(b).sqrMagnitude
    }

    static dot(a: V2Signature, b: V2Signature): number {
        const an = new V2(a).normalize()
        const bn = new V2(b).normalize()

        return an.x * bn.x + an.y * bn.y
    }

    /**
     * Converts input to a vector, if it isn't already.
     */
    static from(...args: V2ConstructorSignature): V2 {
        return args[0] instanceof V2 ? args[0] : new V2(...args)
    }

    x: number
    y: number

    constructor (...args: V2ConstructorSignature) {

        let x, y

        if (isString(args[0]))
            args = args[0].split(',').map(parseFloat) as [number, number]

        else if (isArray(args[0]))
            args = args[0]

        else if (isObject(args[0])) {
            x = args[0].x
            y = args[0].y
        }

        if (isArrayOfNumber(args))
            [x, y] = args

        this.x = x ?? 0
        this.y = y ?? 0
    }

    add(input: V2Signature): this {
        const inputv2 = V2.from(input)

        this.x += inputv2.x
        this.y += inputv2.y
        return this
    }

    sub(input: V2Signature): this {
        const inputv2 = V2.from(input)

        this.x -= inputv2.x
        this.y -= inputv2.y
        return this
    }

    mult(factor: number): this {
        this.x *= factor
        this.y *= factor
        return this
    }

    div(factor: number): this {
        this.x /= factor
        this.y /= factor
        return this
    }

    lerp(to: V2Signature, delta = 0): this {

        const inputv2 = V2.from(to)

        this.x = lerp(this.x, inputv2.x, delta)
        this.y = lerp(this.y, inputv2.y, delta)
        return this
    }

    normalize(): this {
        const mag = this.magnitude

        if (mag !== 0) {
            this.x /= mag
            this.y /= mag
        }

        return this
    }

    rotate(deg: number): this {
        const rad = deg * PI / 180
        const c = cos(rad)
        const s = sin(rad)

        this.x = this.x * c - this.y * s
        this.y = this.x * s + this.y * c

        return this
    }

    perpendicular(): this {

        const x = -this.y
        const y = this.x

        this.x = x
        this.y = y

        return this
            .div(this.magnitude)
    }

    get angle(): number {
        return atan2(this.y, this.x) * 180 / PI
    }

    get magnitude(): number {
        return sqrt(this.sqrMagnitude)
    }

    get sqrMagnitude(): number {
        return this.x ** 2 + this.y ** 2
    }

    set(input: V2Signature): this {

        const inputv2 = V2.from(input)

        this.x = inputv2.x
        this.y = inputv2.y

        return this
    }

    copy(): V2 {
        return this[$$copy]()
    }

    equals(other: unknown): other is V2 {
        return this[$$equals](other)
    }

    toString(): V2String {
        return `${this.x},${this.y}`
    }

    toJSON(): V2Json {
        const { x, y } = this
        return { x, y }
    }

    // Symbolic

    [$$copy](): V2 {
        return new V2(this)
    }

    [$$equals](other: unknown): other is V2 {
        return other != null &&
            other instanceof V2 &&
            this.x === other.x &&
            this.y === other.y
    }

    *[Symbol.iterator](): Generator<number> {
        yield this.x
        yield this.y
    }

}

//// Util ////

interface V2Utility {
    (...args: V2ConstructorSignature): V2

    zero: V2
    up: V2
    right: V2
    down: V2
    left: V2
}

/**
 * Shorthand V2 constructor.
 * Different from V2.from, this method will always create a new V2 instnace, weather or
 * not it receives one as input.
 */
const v2 = ((...args: V2ConstructorSignature): V2 => new V2(...args)) as V2Utility

Object.defineProperties(v2, {
    zero: {
        get() {
            return V2.ZERO
        }, enumerable: true
    },
    up: {
        get() {
            return V2.UP
        },
        enumerable: true
    },
    right: {
        get() {
            return V2.RIGHT
        },
        enumerable: true
    },
    down: {
        get() {
            return V2.DOWN
        },
        enumerable: true
    },
    left: {
        get() {
            return V2.LEFT
        },
        enumerable: true
    },
})

//// Exports ////

export default V2

export {
    V2,
    V2String,
    V2Json,
    V2Signature,

    v2
}