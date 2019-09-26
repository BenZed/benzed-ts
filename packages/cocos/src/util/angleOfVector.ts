/***************************************************************/
// angleOfVector
/***************************************************************/

// get an angle of a vector

/***************************************************************/
// Main
/***************************************************************/

function angleOfVector(vector: cc.Vec2): number {
    const radians = Math.atan2(vector.y, vector.x)
    const degreesWhereUpIs90 = 180 * radians / Math.PI

    const degreesCorrectedWhereUpIs0 = degreesWhereUpIs90 - 90

    return (360 + degreesCorrectedWhereUpIs0) % 360
}

/***************************************************************/
// Exports
/***************************************************************/

export default angleOfVector
