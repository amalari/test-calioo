import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const initializeDynamoDb = () => {
    const isTest = process.env.JEST_WORKER_ID;
    const config = {
        convertEmptyValues: true,
        ...(isTest && {
            endpoint: process.env.DYNAMODB_TEST_ENDPOINT,
            sslEnabled: false,
            region: 'local-env',
            credentials: {
                accessKeyId: 'fakeMyKeyId',
                secretAccessKey: 'fakeSecretAccessKey',
            },
        }),
    };

    return new DocumentClient(config);
}