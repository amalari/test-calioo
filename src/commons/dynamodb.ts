import { DocumentClient } from "aws-sdk/clients/dynamodb";

let options = {}
if(process.env.IS_OFFLINE){
    options = {
        region: 'localhost',
        endpoint: 'http://localhost:8000'
    }
}

export const documentClient = new DocumentClient(options)