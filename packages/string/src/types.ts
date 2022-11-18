
/**
 * Convert a given type to a string representation, or an empty string if that is not possible  
 */
export type ToString<S, Vf extends string = '' /* (V)alue to use if conversion (f)ails*/> = 
    S extends string ? S 
        : S extends number | boolean | bigint ? `${S}` 
            : Vf

/**
* Convert a string type to string[] type, split by delimeter
*/
export type Split<S extends string, D extends string> =
    string extends S ? string[] :
        S extends '' ? [] :
            S extends `${infer Sx}${D}${infer Sxx}` ? [Sx, ...Split<Sxx, D>] :
                [S]

/**
* Created a joined literal string type
*/
export type Join<S extends string[] | readonly string[], D extends string = '-'> = 
 S extends [infer Sx, ...infer Sr]
     ? Sr extends string[] | readonly string[]
         ? Sr extends [] 
             ? Sx 
             : Sx extends '' 
                 ? Join<Sr, D>
                 : `${ToString<Sx>}${D}${Join<Sr, D>}`
         : Sx
     : ToString<S>

export type TrimStart<S extends string, D extends string = ' '> = S extends `${D}${infer Sx}` ? Sx : S

export type TrimEnd<S extends string, D extends string = ' '> = S extends `${infer Sx}${D}` ? Sx : S

export type Trim<S extends string, D extends string = ' '> = TrimStart<TrimEnd<S, D>, D>