// from array string to list of keyof values

export type ValuesOf<T extends readonly string[]> = T[number]
