import { handleError } from "../commons/http";

export class BaseHandlers {
    protected headers = {
        "content-type": "application/json",
    }

    protected handleError(e: unknown){
        return handleError(e)
    }

    protected handleSuccess<T>(status: number, data: T){
        return {
            statusCode: status,
            headers: this.headers,
            body: JSON.stringify(data),
        };
    }
}