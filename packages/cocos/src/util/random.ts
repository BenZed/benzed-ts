
/**
 * Get a random float between a min and max value.
 * If only one argument is provided, it will act as a max value, where min will be 0.
 * If no argument is provided, min will be 0 and max will be 1.
 * @param minOrMax 
 * @param max 
 */
export function float(minOrMax = 1, max?: number): number {

    if (typeof max === 'undefined') {
        max = minOrMax
        minOrMax = 0
    }

    return Math.random() * (max - minOrMax) + minOrMax
}

/**
 * Get a random float between a min and max value.
 * If only one argument is provided, it will act as a max value, where min will be 0.
 * If no argument is provided, min will be 0 and max will be 1.
 * @param minOrMax 
 * @param max 
 */
export function integer(minOrMax = 1, max?: number): number {

    const number = float(minOrMax, max)
    const integer = Math.floor(number)

    return integer
}

/**
 * Get a random Vec2 between a min and max magnitude.
 * If only one argument is provided, it will act as a max value, where min will be 0.
 * If no argument is provided, min will be 0 and max will be 1.
 * @param minOrMax 
 * @param max 
 */
export function v2(minOrMax = 1, max?: number): cc.Vec2 {

    const magnitude = float(minOrMax, max)
    const radians = float(0, Math.PI * 2)

    return new cc.Vec2(
        Math.cos(radians) * magnitude,
        Math.sin(radians) * magnitude
    )
}

/**
 * Returns a random index for a given arrayLike.
 * @param arrayLike 
 */
export function index(arrayLike: { length: number }): number {
    return integer(0, arrayLike.length)
}

/**
 * Returns a random item from a given arrayLike collection.
 * @param arrayLike 
 */
export function item(arrayLike: { length: number; [index: number]: unknown }): unknown {
    const rIndex = index(arrayLike)

    return arrayLike[rIndex]
}