import { Cursor } from './cursor';

export * from './cursor'

/**
 * Create a cursor to a location on the file system.
 */
export default async function (path: string): Promise<Cursor> {
    return new Cursor(path)
}