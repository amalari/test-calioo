import * as yup from "yup";

export enum httpStatusCodes {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER = 500
}

export class HttpError extends Error {
    constructor(public statusCode: number, body: Record<string, unknown> = {}) {
      super(JSON.stringify(body));
    }
}

export const handleError = (e: unknown) => {
    const headers = {
        "content-type": "application/json",
    };
        
    if (e instanceof yup.ValidationError) {
        return {
          statusCode: httpStatusCodes.BAD_REQUEST,
          headers,
          body: JSON.stringify({
            errors: e.errors,
          }),
        };
    }
    
    if (e instanceof SyntaxError) {
        return {
            statusCode: httpStatusCodes.BAD_REQUEST,
            headers,
            body: JSON.stringify({ error: `invalid request body format : "${e.message}"` }),
        };
    }

    if (e instanceof HttpError) {
        return {
            statusCode: e.statusCode,
            headers,
            body: e.message,
        };
    }

    return {
        statusCode: httpStatusCodes.INTERNAL_SERVER,
        headers,
        body: JSON.stringify({ error: 'internal server error, please contact adminisitrator' }),
    };
}