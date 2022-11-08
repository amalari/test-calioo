export type TPagination = {
    size: number
    next: {[key: string]: string} | null
    prev: {[key: string]: string} | null
}

export type TMeta = {
    pagination: TPagination
}
