import lerp from './lerp'

import { equals, $$copy, $$equals } from '@benzed/immutable'
import { isArray, isNumber, isObject, isString } from '@benzed/is'

import { cos, sin, sqrt, atan2 } from './overrides'
import { PI } from './constants'

/*** Types ***/

type V2String = `${number},${number}`

type V2ConstructorSignature = [V2String] | [{ x?: number, y?: number }] | number[]

/*** Main ***/

class V2 {

    public static get ZERO(): V2 {
        return V2.from(0, 0)
    }

    public static get UP(): V2 {
        return V2.from(0, 1)
    }

    public static get RIGHT(): V2 {
        return V2.from(1, 0)
    }

    public static get DOWN(): V2 {
        return V2.from(0, -1)
    }

    public static get LEFT(): V2 {
        return V2.from(-1, 0)
    }

    public static lerp(from: V2, to: V2, delta = 0): V2 {

        const x = lerp(from.x, to.x, delta)
        const y = lerp(from.y, to.y, delta)

        return V2.from(x, y)
    }

    public static distance(from: V2, to: V2): number {
        return sqrt(this.sqrDistance(from, to))
    }

    public static sqrDistance(from: V2, to: V2): number {
        return from.sub(to).sqrMagnitude
    }

    public static dot(a: V2, b: V2): number {
        const an = a.normalize()
        const bn = b.normalize()

        return an.x * bn.x + an.y * bn.y
    }

    public static from(...args: V2ConstructorSignature): V2 {
        return new V2(...args)
    }

    public x: number
    public y: number

    public constructor(...args: V2ConstructorSignature) {

        let x, y

        if (isString(args[0]))
            args = args[0].split(',').map(parseFloat) as [number, number]

        else if (isObject(args[0])) {
            x = args[0].x
            y = args[0].y
        }

        if (isArray(args))
            [x, y] = (args as number[]).filter(isNumber) as number[]

        this.x = x ?? 0
        this.y = y ?? 0
    }

    public add(vec: V2): this {
        this.x += vec.x
        this.y += vec.y
        return this
    }

    public sub(vec: V2): this {
        this.x -= vec.x
        this.y -= vec.y
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

    public lerp(to = V2.ZERO, delta = 0): this {
        this.x = lerp(this.x, to.x, delta)
        this.y = lerp(this.y, to.y, delta)
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

    public set(vector: V2): this {
        this.x = vector.x
        this.y = vector.y

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

    public toJSON(): { x: number, y: number } {
        return {
            x: this.x,
            y: this.y
        }
    }

    // Symbolic

    public [$$copy](): V2 {
        return V2.from(this)
    }

    public [$$equals](other: unknown): other is V2 {
        return other != null &&
            other instanceof V2 &&
            equals(this.x, other.x) &&
            equals(this.y, other.y)
    }

    public *[Symbol.iterator](): Generator<number> {
        yield this.x
        yield this.y
    }

}

/*** Util ***/

const v2 = V2.from

/*** Exports ***/

export default V2

export {
    V2,
    V2String,

    v2
}