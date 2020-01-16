function unique<T>(array: T[]): T[] {

    const arrayUnique: T[] = []

    for (const item of array)
        if (!arrayUnique.includes(item))
            arrayUnique.push(item)

    return arrayUnique

}

/***************************************************************/
// Exports
/***************************************************************/

export default unique