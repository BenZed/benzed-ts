import { wrap } from '@benzed/array'
import { equals, copy, $$equals, $$copy } from '@benzed/immutable'
import { max } from '@benzed/math'

import {
    Historical,
    HistoryEntry,
    HistoryMeta,
    HistoryScribeInput,
    HistoryScribeOptions
} from './types'

import HistoryInvalidError from './error'
import {
    applyData,
    cleanPatchEntry,
    resolveHistoryMeta,
    entryContainsData,
    isSameAgeOrOlder,
    mergePatchEntry,
    resolveIndex,
    toDate
} from './helper'

/*** Types ***/

/**
 * By default, sigantures are strings.
 */
type Signature = string

/*** Main ***/

/**
 * A scribe instance provides an interface for computing immutable history
 * updates on arbitrary objects.
 */
class HistoryScribe<T extends object, I = Signature> {

    static from<T extends object, I>(
        history: HistoryEntry<T, I>[]
    ): HistoryScribe<T, I> {
        return new HistoryScribe<T, I>({ history })
    }

    readonly options: Required<HistoryScribeOptions<T>>
    constructor (
        options: HistoryScribeOptions<T> & HistoryScribeInput<T, I> = {}
    ) {

        const {
            collapseInterval = 0,
            collapseMask = [],
        } = options

        this.options = {
            collapseInterval,
            collapseMask
        }

        this._history = `data` in options && options.data
            ? [{
                method: `create`,
                data: copy(options.data),
                ...resolveHistoryMeta()
            }]
            : `history` in options && options.history
                ? wrap(copy(options.history))
                : []

        if (this._history.length > 0)
            this._validate()
    }

    private readonly _history: HistoryEntry<T, I>[]
    get history(): readonly HistoryEntry<T, I>[] {
        return [...this._history]
    }

    private readonly _data: Partial<T> = {}
    get data(): Readonly<T> {
        return { ...this._data as T }
    }

    /**
     * Create a new HistoryScribe with a create entry appended.
     * @param data Complete data
     * @param signature Signature or meta data.
     * @returns HistoryScribe
     */
    create(data: T, signature?: I | Partial<HistoryMeta<I>>): HistoryScribe<T, I> {
        return this.push({
            method: `create`,
            data,
            ...resolveHistoryMeta(signature)
        })
    }

    /**
     * Create a new HistoryScribe with a patch entry appended.
     * @param data Partial Data
     * @param signature Signature or meta data.
     * @returns HistoryScribe 
     */
    patch(data: Partial<T>, signature?: I | Partial<HistoryMeta<I>>): HistoryScribe<T, I> {
        return this.push({
            method: `patch`,
            data,
            ...resolveHistoryMeta(signature)
        })
    }

    /**
     * Create a new HistoryScribe with a remove entry appended.
     * @param signature Signature or meta data. 
     * @returns HistoryScribe
     */
    remove(signature?: I | Partial<HistoryMeta<I>>): HistoryScribe<T, I> {
        return this.push({
            method: `remove`,
            ...resolveHistoryMeta(signature)
        })
    }

    /**
     * Create a new HistoryScribe with an appended entry.
     * @returns HistoryScribe
     */
    push(
        entry: HistoryEntry<T, I>
    ): HistoryScribe<T, I> {
        return this.splice(
            this._history.length,
            0,
            entry
        )
    }

    /**
     * Create a new HistoryScribe with the final entry removed.
     * @returns HistoryScribe
     */
    pop(): HistoryScribe<T, I> {
        return this.splice(
            this._history.length - 1,
            1
        )
    }

    /**
     * Create a new HistoryScribe with all entries from the given index or date
     * onward removed.
     * @param indexOrDate Wrappable index or date
     * @returns HistoryScribe
     */
    revert(indexOrDate: number | Date | string): HistoryScribe<T, I> {
        return this.splice(
            indexOrDate,
            this._history.length
        )
    }

    /**
     * Create a new HistoryScribe with entries spliced. 
     * 
     * @param startIndexOrDate Wrappable index or date
     * @param deleteCount Number of entries to remove
     * @param insert Entries to be added at the point of deletion.
     * @returns HistoryScribe
     */
    splice(
        startIndexOrDate: number | Date | string,
        deleteCount: number,
        ...insert: HistoryEntry<T, I>[]
    ): HistoryScribe<T, I> {

        const { _history: history } = this

        const index = resolveIndex(startIndexOrDate, history, true)

        const splicedHistory = [...history]
        splicedHistory.splice(index, deleteCount, ...insert)

        return this.replace(splicedHistory)
    }

    /**
     * Create a new HistoryScribe with the given history replaced.
     * @returns HistoryScribe
     */
    replace(
        history: HistoryEntry<T, I>[]
    ): HistoryScribe<T, I> {
        const scribe = new HistoryScribe<T, I>(this.options)
        scribe._validate(history)
        return scribe
    }

    /**
     * Compile the history scribe into a historical obect.
     * @returns Historical
     */
    compile(): T & Historical<T, I> {
        const { _history: history, _data: data } = this
        if (history.length === 0)
            throw new HistoryInvalidError(`No entries.`)

        return copy({
            ...data as T,
            history
        })
    }

    /*** @benzed/immutable Implementation ***/

    /**
     * Creates a deep copy of this scribe with the same state. 
     */
    copy(): HistoryScribe<T, I> {
        return this[$$copy]()
    }

    /**
     * Is this history scribe equal to another?
     * @param other 
     */
    equals(other: HistoryScribe<T, I>): other is HistoryScribe<T, I> {
        return this[$$equals](other)
    }

    private [$$copy](): HistoryScribe<T, I> {
        const { options, _history: history } = this

        return new HistoryScribe({ ...options, history })
    }

    private [$$equals](other: HistoryScribe<T, I>): other is HistoryScribe<T, I> {
        return equals(this.options, other.options) &&
            equals(this._history, other._history)
    }

    /*** Helper ***/

    /**
     * Mutate a given historical to be valid, or throw if that is not possible.
     */
    private _validate(history = this._history): void {

        // validation state 
        const valid = {
            history: [] as HistoryEntry<T, I>[],
            data: [] as T[],
            removeEntryExists: false,
            prevEntryTimeStamp: 0
        }

        // build valid history from existing
        for (let i = 0; i < history.length; i++) {
            let entry = history[i]
            const isFirstIndex = i === 0

            // assert sorted chronologicaly
            if (!isSameAgeOrOlder(valid.prevEntryTimeStamp, entry.timestamp))
                throw new HistoryInvalidError(`Entries must be in chronological order.`)
            else
                valid.prevEntryTimeStamp = entry.timestamp

            // handle Entry
            switch (entry.method) {

                case `create`: {
                    // validate create entry
                    if (!isFirstIndex)
                        throw new HistoryInvalidError(`"create" entry must be first.`)

                    // update valid data to include create data
                    valid.data.push({ ...entry.data })
                    break
                }

                case `patch`: {
                    // validate patch entry
                    if (isFirstIndex) {
                        throw new HistoryInvalidError(
                            `"patch" entry must be placed after a "create" entry.`
                        )
                    }

                    if (valid.removeEntryExists) {
                        throw new HistoryInvalidError(
                            `"patch" entry cannot be after a "remove" entry.`
                        )
                    }

                    // collapse with previous patch entries, if possible
                    if (this._canCollapseEntry(entry, valid.history.at(-1))) {
                        const prevEntry =
                            valid.history.pop() as { method: 'patch', data: T } & HistoryMeta<I>
                        valid.data.pop()

                        entry = mergePatchEntry(
                            prevEntry,
                            entry.data
                        )
                    }

                    const currentValidData = valid.data.at(-1) as T

                    // remove redundant data 
                    entry = cleanPatchEntry(entry, currentValidData)
                    if (!entryContainsData(entry))
                        continue // skipping emptry or redundant 'patch' entry

                    // update valid data to include patch data
                    valid.data.push(
                        applyData(
                            { ...currentValidData },
                            entry.data
                        )
                    )
                    break
                }

                case `remove`: {
                    // validate remove entry
                    if (isFirstIndex) {
                        throw new HistoryInvalidError(
                            `"remove" entry must be be placed after a "create" entry.`
                        )
                    }

                    if (!valid.removeEntryExists)
                        valid.removeEntryExists = true
                    else
                        throw new HistoryInvalidError(`There can only be one "remove" entry.`)
                    break
                }
            }

            // entry is valid
            valid.history.push(entry)
        }

        // validate num entries
        if (valid.history.length === 0)
            throw new HistoryInvalidError(`No entries.`)

        // apply validated history & data
        this._history.length = 0
        this._history.push(...valid.history)
        applyData(this._data, valid.data.at(-1) as T)
    }

    private _canCollapseEntry(
        source: { method: 'patch', data: Partial<T> } & HistoryMeta<I>,
        target: HistoryEntry<T, I> | undefined
    ): target is ({ method: 'patch', data: Partial<T> } & HistoryMeta<I>) {

        if (!target)
            return false

        // only patch entries can be merged
        if (target.method !== `patch`)
            return false

        // no collapsing data with keys in the collapse mask
        for (const key of this.options.collapseMask) {
            if (key in source.data)
                return false
        }

        // only collapse objects with the same signature
        if (!equals(source.signature, target.signature))
            return false

        // check that dates are within range
        return max(
            toDate(source.timestamp).getTime() -
            toDate(target.timestamp).getTime(),
            0
        ) < this.options.collapseInterval
    }
}

/*** Exports ***/

export default HistoryScribe

export {
    HistoryScribe,
    HistoryScribeOptions
}