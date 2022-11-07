export type FindAllInput = {
    limit: number
    lastKey?: string
}

export type FindAllOutput<T> = {
    data: T
    lastKey: {[key: string]: string} | null
}