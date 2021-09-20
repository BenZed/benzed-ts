import lerp from './lerp'

import { $$copy, $$equals } from '@benzed/immutable'
import { isArray, isArrayOfNumber, isObject, isString } from '@benzed/is'

import { cos, sin, sqrt, atan2 } from './overrides'
import { PI } from './constants'

/*** Types ***/

type V2String = `${number},${number}`

type V2Json = { x: number, y: number }

type V2Signature = Partial<V2Json> | V2String | [number, number]

type V2ConstructorSignature = [V2Signature] | [number, number]

/*** Main ***/

class V2 {

    public static get ZERO(): V2 {
        return new V2(0, 0)
    }

    public static get UP(): V2 {
        return new V2(0, 1)
    }

    public static get RIGHT(): V2 {
        return new V2(1, 0)
    }

    public static get DOWN(): V2 {
        return new V2(0, -1)
    }

    public static get LEFT(): V2 {
        return new V2(-1, 0)
    }

    public static lerp(a: V2Signature, b: V2Signature, delta = 0): V2 {

        const av2 = V2.from(a)
        const bv2 = V2.from(b)

        const x = lerp(av2.x, bv2.x, delta)
        const y = lerp(av2.y, bv2.y, delta)

        return new V2(x, y)
    }

    public static distance(a: V2Signature, b: V2Signature): number {
        return sqrt(this.sqrDistance(a, b))
    }

    public static sqrDistance(a: V2Signature, b: V2Signature): number {
        return new V2(a).sub(b).sqrMagnitude
    }

    public static dot(a: V2Signature, b: V2Signature): number {
        const an = new V2(a).normalize()
        const bn = new V2(b).normalize()

        return an.x * bn.x + an.y * bn.y
    }

    /**
     * Converts input to a vector, if it isn't already.
     */
    public static from(...args: V2ConstructorSignature): V2 {
        return args[0] instanceof V2 ? args[0] : new V2(...args)
    }

    public x: number
    public y: number

    public constructor(...args: V2ConstructorSignature) {

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

    public add(input: V2Signature): this {
        const inputv2 = V2.from(input)

        this.x += inputv2.x
        this.y += inputv2.y
        return this
    }

    public sub(input: V2Signature): this {
        const inputv2 = V2.from(input)

        this.x -= inputv2.x
        this.y -= inputv2.y
        return this
    }

    public mult(factor: number): this {
        this.x *= factor
        this.y *= factor
        return this
    }

    public div(factor: number): this {
        this.x /= factor
        this.y /= factor
        return this
    }

    public lerp(to: V2Signature, delta = 0): this {

        const inputv2 = V2.from(to)

        this.x = lerp(this.x, inputv2.x, delta)
        this.y = lerp(this.y, inputv2.y, delta)
        return this
    }

    public normalize(): this {
        const mag = this.magnitude

        if (mag !== 0) {
            this.x /= mag
            this.y /= mag
        }

        return this
    }

    public rotate(deg: number): this {
        const rad = deg * PI / 180
        const c = cos(rad)
        const s = sin(rad)

        this.x = this.x * c - this.y * s
        this.y = this.x * s + this.y * c

        return this
    }

    public perpendicular(): this {

        const x = -this.y
        const y = this.x

        this.x = x
        this.y = y

        return this
            .div(this.magnitude)
    }

    public get angle(): number {
        return atan2(this.y, this.x) * 180 / PI
    }

    public get magnitude(): number {
        return sqrt(this.sqrMagnitude)
    }

    public get sqrMagnitude(): number {
        return this.x ** 2 + this.y ** 2
    }

    public set(input: V2Signature): this {

        const inputv2 = V2.from(input)

        this.x = inputv2.x
        this.y = inputv2.y

        return this
    }

    public copy(): V2 {
        return this[$$copy]()
    }

    public equals(other: unknown): other is V2 {
        return this[$$equals](other)
    }

    public toString(): V2String {
        return `${this.x},${this.y}`
    }

    public toJSON(): V2Json {
        const { x, y } = this
        return { x, y }
    }

    // Symbolic

    public [$$copy](): V2 {
        return new V2(this)
    }

    public [$$equals](other: unknown): other is V2 {
        return other != null &&
            other instanceof V2 &&
            this.x === other.x &&
            this.y === other.y
    }

    public *[Symbol.iterator](): Generator<number> {
        yield this.x
        yield this.y
    }

}

/*** Util ***/

const v2 = (...args: V2ConstructorSignature): V2 => new V2(...args)

/*** Exports ***/

export default V2

export {
    V2,
    V2String,
    V2Json,
    V2Signature,

    v2
}