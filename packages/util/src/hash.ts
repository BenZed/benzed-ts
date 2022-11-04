import crypto, { BinaryToTextEncoding, Hash } from 'crypto'
import {  Writable } from 'stream'
import { Func } from './types'

//// CONSTANTS ////

const HASHES = [
    ...crypto.getHashes ? crypto.getHashes().slice() : [`sha1`, `md5`],
    `passthrough`
] as const

const ENCODINGS = [`buffer`, `hex`, `binary`, `base64`] as const

//// Types ////

interface HashOptions<T extends object> {

    /**
     * Hash algorithm to use. 'sha1' | 'md5' | 'passthrough' ...etc
     * @defaultValue 'sha1'
     */
    algorithm: string

    /**
     * Consider only object keys
     * @defaultValue true
     */
    excludeValues: boolean

    /**
     * Do not include these keys when hashing
     */
    excludeKeys: (keyof T)[]

    /**
     * @defaultValue 'hex'
     */
    encoding: typeof ENCODINGS[number]

    /**
     * Ignore unknown object types.
     * @defaultValue false
     */
    ignoreUnknown: boolean

    /**
     * Optional method that remaps values before hashing
     */
    replacer?: (input: unknown) => unknown 

    /**
     * @defaultValue true
     */
    respectFunctionProperties: boolean

    /**
     * @defaultValue true
     */
    respectFunctionNames: boolean

    /**
     * Respect special properties (prototype, constructor) when hashing to distinguish between types
     * @defaultValue true
     */
    respectType: boolean

    /**
     * Sort all arrays before hashing
     * @defaultValue false
     */
    unorderedArrays: boolean

    /**
     * Sort Set and Map instances before hashing
     * @defaultValue true
     */
    unorderedSets: boolean

    /**
     * Sort object keys before hashing
     * @defaultValue true
     */
    unorderedObjects: boolean

}

//// Main ////

/**
 * @param object Value to hash
 * @return Hashed value
 */
function hash<T extends object>(object: T, options: Partial<HashOptions<T>> = {}): string | Buffer {
    return hashObject(object, applyDefaults(options))
}

/**
 * @param object Value to hash
 * @returns Hashed value
 */
function sha1<T extends object>(object: T): string | Buffer {
    return hash(object)
}

/**
 * Hash keys only
 * @param object 
 * @returns Hashed value
 */
function keys<T extends object>(object: T): string | Buffer {
    return hash(object, { excludeValues: true })
}

/**
 * Hash with md5 algrorithm
 * @param object Value to hash
 * @returns Hashed value
 */
function MD5<T extends object>(object: T): string | Buffer {
    return hash(object, { algorithm: `md5` })
}

/**
 * Hash keys with md5 algorithm
 * @param object 
 * @returns 
 */
function keysMD5<T extends object>(object: T): string | Buffer {
    return hash(object, {algorithm: `md5`, excludeValues: true})
}


function writeToStream<T extends object>(
    object: T, 
    stream: Writable
): ReturnType<typeof typeHasher>

/**
 * Expose streaming API
 *
 * @param {object} object  Value to serialize
 * @param {object} options  Options, as for hash()
 * @param {Writable} stream  A stream to write the serializiation to
 */
function writeToStream<T extends object>(
    object: T, 
    options: Partial<HashOptions<T>>, 
    stream: Writable
): ReturnType<typeof typeHasher>

function writeToStream(args: [object, Partial<HashOptions<object>>, Writable] | [object, Writable])  {

    let [object, options, stream] = args

    if (typeof stream === `undefined`) {
        stream = options as Writable
        options = {}
    }

    return typeHasher(applyDefaults(options as HashOptions<object>), stream).dispatch(object)
}

//// Helper ////

function applyDefaults<T extends object>({ algorithm = `sha1`, ...input }: Partial<HashOptions<T>> = {}): HashOptions<T> {

    // if there is a case-insensitive match in the hashes list, accept it
    // (i.e. SHA256 for sha256)
    algorithm = HASHES.reduce((algo, cryptoAlgo) => algo === cryptoAlgo.toLowerCase() ? cryptoAlgo : algo, algorithm.toLowerCase())

    const output: HashOptions<T> = {
        algorithm,
        encoding: `hex`,
        excludeValues: true,
        ignoreUnknown: false,
        respectType: true,
        respectFunctionNames: true,
        respectFunctionProperties: true,
        unorderedArrays: false,
        unorderedSets: true,
        unorderedObjects: true,
        excludeKeys: [],
        ...input
    }

    if (!HASHES.includes(output.algorithm))
        throw new Error(`Algorithm "${output.algorithm}" not supported. Supported values: ${HASHES.join(`, `)}`)

    return output
}

/** Check if the given function is a native function */
function isNativeFunction(f: unknown): f is Func {
    if (typeof f !== `function`) 
        return false
  
    const exp = /^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i
    return exp.exec(Function.prototype.toString.call(f)) != null
}

function hashObject<T extends object>(object: T, options: HashOptions<T>): string | Buffer {
    let hashingStream: Hash | HashPassThrough

    if (options.algorithm !== `passthrough`) 
        hashingStream = crypto.createHash(options.algorithm)
    else 
        hashingStream = new HashPassThrough()

    if (typeof hashingStream.write === `undefined`) {
        hashingStream.write = (hashingStream as Hash).update
        hashingStream.end = (hashingStream as Hash).update
    }

    const hasher = typeHasher(options, hashingStream)
    hasher.dispatch(object)
    if (!('update' in hashingStream)) 
        hashingStream.end(``)

    if ('digest' in hashingStream)
        return options.encoding === `buffer` 
            ? hashingStream.digest().toString()
            : hashingStream.digest(options.encoding)

    const buf = hashingStream.read() as string | Buffer
    if (options.encoding === `buffer`) 
        return buf

    return buf.toString(options.encoding)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function typeHasher<T extends object>(options: HashOptions<T>, writeTo: Hash | HashPassThrough, context: unknown[] = []) {

    const write = (str: string) => writeTo.update 
        ? writeTo.update(str, `utf8`) 
        : writeTo.write(str, `utf8`)

    return {

        dispatch(value: unknown) {
            if (options.replacer) 
                value = options.replacer(value)

            let type: string = typeof value
            if (value === null) 
                type = `null`

            //console.log("[DEBUG] Dispatch: ", value, "->", type, " -> ", "_" + type);

            return this[`_` + type](value)
        },

        _object (object: object) {

            const pattern = (/\[object (.*)\]/i)
            
            const objString = Object.prototype.toString.call(object)

            let [objType] = pattern.exec(objString) ?? [`unknown:[` + objString + `]`]
            objType = objType.toLowerCase()

            let objectNumber = null
            if ((objectNumber = context.indexOf(object)) >= 0) 
                return this.dispatch(`[CIRCULAR:${objectNumber}]`)
            else 
                context.push(object)

            if (typeof Buffer !== `undefined` && Buffer.isBuffer && Buffer.isBuffer(object)) {
                write(`buffer:`)
                return write(object)
            }

            if (objType !== `object` && objType !== `function` && objType !== `asyncfunction`) {
                if (this[`_` + objType]) 
                    this[`_` + objType](object)
                else if (options.ignoreUnknown) 
                    return write(`[` + objType + `]`)
                else 
                    throw new Error(`Unknown object type "` + objType + `"`)
        
            }else{
                let keys = Object.keys(object)
                if (options.unorderedObjects) 
                    keys = keys.sort()
        
                // Make sure to incorporate special properties, so
                // Types with different prototypes will produce
                // a different hash and objects derived from
                // different functions (`new Foo`, `new Bar`) will
                // produce different hashes.
                // We never do this for native functions since some
                // seem to break because of that.
                if (options.respectType !== false && !isNativeFunction(object)) 
                    keys.splice(0, 0, `prototype`, `__proto__`, `constructor`)

                if (options.excludeKeys) {
                    keys = keys.filter(function(key) {
                        return !options.excludeKeys(key) 
                    })
                }

                write(`object:` + keys.length + `:`)
                const self = this
                return keys.forEach(function(key){
                    self.dispatch(key)
                    write(`:`)
                    if(!options.excludeValues) 
                        self.dispatch(object[key])
          
                    write(`,`)
                })
            }
        },

        _array(arr: unknown[], unordered: boolean = options.unorderedArrays) {

            write(`array:${arr.length}:`)
            if (!unordered || arr.length <= 1) 
                return arr.forEach(entry => this.dispatch(entry))

            // the unordered case is a little more complicated:
            // since there is no canonical ordering on objects,
            // i.e. {a:1} < {a:2} and {a:1} > {a:2} are both false,
            // we first serialize each entry using a PassThrough stream
            // before sorting.
            // also: we can’t use the same context array for all entries
            // since the order of hashing should *not* matter. instead,
            // we keep track of the additions to a copy of the context array
            // and add all of them to the global context array when we’re done
            let contextAdditions: unknown[] = []

            const entries = arr.map(entry => {
                
                const stream = new HashPassThrough()
                
                const localContext = [...context]

                const hasher = typeHasher(options, stream, localContext)
                hasher.dispatch(entry)
                
                // take only what was added to localContext and append it to contextAdditions
                contextAdditions = [...contextAdditions, ...localContext.slice(context.length)]
                
                return stream.read().toString()
            })

            context = [ ...contextAdditions ]

            entries.sort()
            return this._array(entries, false)
        },

        _date(date: Date){
            return write(`date:` + date.toJSON())
        },

        _symbol(sym: symbol){
            return write(`symbol:` + sym.toString())
        },

        _error(err: Error){
            return write(`error:` + err.toString())
        },

        _boolean(bool: boolean){
            return write(`bool:` + bool.toString())
        },

        _string(str: string){
            write(`string:${str.length}:`)
            write(str.toString())
        },

        _function(fn: { name: string, toString(): string }){
            write(`fn:`)
            if (isNativeFunction(fn)) 
                this.dispatch(`[native]`)
            else 
                this.dispatch(fn.toString())

            if (options.respectFunctionNames !== false) {
                // Make sure we can still distinguish native functions
                // by their name, otherwise String and Function will
                // have the same hash
                this.dispatch(`function-name:` + String(fn.name))
            }

            if (options.respectFunctionProperties) 
                this._object(fn)
      
        },

        _number(number: number){
            return write(`number:${number}`)
        },

        _xml(xml: { toString(): string }){
            return write(`xml:${xml}`)
        },

        _null() {
            return write(`Null`)
        },

        _undefined() {
            return write(`Undefined`)
        },

        _regexp(regex: RegExp){
            return write(`regex:${regex}`)
        },

        _uint8array(arr: Uint8Array){
            write(`uint8array:`)
            return this.dispatch(Array.prototype.slice.call(arr))
        },

        _uint8clampedarray(arr: Uint8ClampedArray){
            write(`uint8clampedarray:`)
            return this.dispatch(Array.prototype.slice.call(arr))
        },

        _int8array(arr: Int8Array){
            write(`int8array:`)
            return this.dispatch(Array.prototype.slice.call(arr))
        },

        _uint16array(arr: Uint16Array){
            write(`uint16array:`)
            return this.dispatch(Array.prototype.slice.call(arr))
        },

        _int16array(arr: Int16Array){
            write(`int16array:`)
            return this.dispatch(Array.prototype.slice.call(arr))
        },

        _uint32array(arr: Uint32Array){
            write(`uint32array:`)
            return this.dispatch(Array.prototype.slice.call(arr))
        },

        _int32array(arr: Int32Array){
            write(`int32array:`)
            return this.dispatch(Array.prototype.slice.call(arr))
        },

        _float32array(arr: Float32Array){
            write(`float32array:`)
            return this.dispatch(Array.prototype.slice.call(arr))
        },

        _float64array(arr: Float64Array){
            write(`float64array:`)
            return this.dispatch(Array.prototype.slice.call(arr))
        },

        _arraybuffer(arr: ArrayBuffer){
            write(`arraybuffer:`)
            return this.dispatch(new Uint8Array(arr))
        },

        _url(url: string) {
            return write(`url:` + url.toString())
        },

        _map(map: Map<unknown,unknown>) {
            write(`map:`)
            const arr = Array.from(map)
            return this._array(arr, options.unorderedSets !== false)
        },

        _set(set: Set<unknown>) {
            write(`set:`)
            const arr = Array.from(set)
            return this._array(arr, options.unorderedSets !== false)
        },

        _file(file: { name: string, size: number, type: string, lastModfied: number }) {
            write(`file:`)
            return this.dispatch([file.name, file.size, file.type, file.lastModfied])
        },

        _blob() {
            if (options.ignoreUnknown) 
                return write(`[blob]`)

            throw Error(
                `Hashing Blob objects is currently not supported\n` +
                `(see https://github.com/puleos/object-hash/issues/26)\n` +
                `Use "options.replacer" or "options.ignoreUnknown"\n`
            )
        },

        _domwindow() {
            return write(`domwindow`) 
        },

        _bigint(number: bigint) {
            return write(`bigint:` + number.toString())
        },

        /* Node.js standard native objects */
        _process() {
            return write(`process`) 
        },

        _timer() {
            return write(`timer`) 
        },

        _pipe() {
            return write(`pipe`) 
        },

        _tcp() {
            return write(`tcp`) 
        },

        _udp() {
            return write(`udp`) 
        },

        _tty() {
            return write(`tty`) 
        },

        _statwatcher() {
            return write(`statwatcher`) 
        },

        _securecontext() {
            return write(`securecontext`) 
        },

        _connection() {
            return write(`connection`) 
        },

        _zlib() {
            return write(`zlib`) 
        },

        _context() {
            return write(`context`) 
        },

        _nodescript() {
            return write(`nodescript`) 
        },

        _httpparser() {
            return write(`httpparser`) 
        },

        _dataview() {
            return write(`dataview`) 
        },

        _signal() {
            return write(`signal`) 
        },

        _fsevent() {
            return write(`fsevent`) 
        },

        _tlswrap() {
            return write(`tlswrap`) 
        },

    }
}

// Mini-implementation of stream.PassThrough
// We are far from having need for the full implementation, and we can
// make assumptions like "many writes, then only one final read"
// and we can ignore encoding specifics
class HashPassThrough {
    
    private _buffer = ``

    write(b: string): void {
        this._buffer += b
    }

    end(b: string): void {
        this._buffer += b
    }

    read(): string {
        return this._buffer
    }
}

/*** Exports ***/

export default hash

export {
    writeToStream,
    hash,
    sha1,
    MD5,
    keys,
    keysMD5
}