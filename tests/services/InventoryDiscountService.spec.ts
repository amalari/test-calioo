import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import { GetItemInput, PutItemInput, UpdateItemInput } from 'aws-sdk/clients/dynamodb';
import { InventoryDiscountReqDto } from '../../src/dto/InventoryDiscountReqDto';
import { Category, CATEGORY_ALL } from '../../src/models/Inventory';

describe('InventoryDiscountService', () => {
    beforeAll(() => {
        AWSMock.setSDKInstance(AWS);
    });
    afterAll(() => {
        AWSMock.restore('DynamoDB.DocumentClient');
    })

    test('findAll method should return list inventory discount model with total 2', async () => {
        const inventoryDiscounts = [{
            category: CATEGORY_ALL,
            discount: 20
        }, {
            category: Category.FOOD,
            disocunt: 10
        }]
        // eslint-disable-next-line @typescript-eslint/ban-types
        AWSMock.mock('DynamoDB.DocumentClient', 'scan', (params: GetItemInput, callback: Function) => {
            callback(null, {Items: inventoryDiscounts});
        });
        const inventoryDiscountService = jest.requireActual('../../src/services/InventoryDiscountService').default
        const inventories = await inventoryDiscountService.findAll()
        expect(inventories.length).toBe(2)
    });

    test('upsert method should return inventory model', async () => {
        const input : InventoryDiscountReqDto = {
            category: Category.FOOD,
            discount: 10
        }
        // eslint-disable-next-line @typescript-eslint/ban-types
        AWSMock.mock('DynamoDB.DocumentClient', 'get', (params: GetItemInput, callback: Function) => {
            callback(null, {Items: input});
        });        
        // eslint-disable-next-line @typescript-eslint/ban-types
        AWSMock.mock('DynamoDB.DocumentClient', 'put', (params: PutItemInput, callback: Function) => {
            callback(null, {Items: input});
        });
        // eslint-disable-next-line @typescript-eslint/ban-types
        AWSMock.mock('DynamoDB.DocumentClient', 'update', (params: UpdateItemInput, callback: Function) => {
            callback(null, {Items: input});
        });
        
        const inventoryDiscountService = jest.requireActual('../../src/services/InventoryDiscountService').default
        const inventory = await inventoryDiscountService.upsert(input)
        expect(inventory.category).toBe(input.category)
        expect(inventory.discount).toBe(input.discount)
    });
})