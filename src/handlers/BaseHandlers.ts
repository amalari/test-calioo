import { handleError } from "../commons/http";

export type TPagination = {
    size: number
    next: {[key: string]: string} | null
    prev: {[key: string]: string} | null
}

type TMeta = {
    pagination: TPagination
}
export class BaseHandlers {
    protected headers = {
        "content-type": "application/json",
    }

    protected handleError(e: unknown){
        return handleError(e)
    }

    protected handleSuccess<T>(status: number, data: T, meta?: TMeta){
        const response: { data: T, meta?: TMeta } = { data }
        if(meta) response.meta = meta
        return {
            statusCode: status,
            headers: this.headers,
            body: JSON.stringify(response),
        };
    }
}