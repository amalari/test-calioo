import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import { GetItemInput, PutItemInput } from 'aws-sdk/clients/dynamodb';
import { InventoryReqDto } from '../../src/dto/InventoryReqDt';
import { Category, CATEGORY_ALL, InventoryModel } from '../../src/models/Inventory';
import { InventoryDiscountModel } from '../../src/models/InventoryDiscount';

const spyInventoryDiscountServiceFindAll = jest.fn().mockImplementation(() => {
    Promise.resolve(true);
});
jest.mock('../../src/services/InventoryDiscountService', () => ({
    findAll: spyInventoryDiscountServiceFindAll
}));

describe('InventoryService', () => {
    const defaultInvetory = {
        category: Category.FOOD,
        name: 'bread',
        currentStock: 5,
        restaurantId: "1",
        inventoryId: "food#1#1",
        price: 10,
        supplier: JSON.stringify({
            name: 'bread supplier',
            description: 'bread supplier description'
        })
    }
    const defaultInventories = [{
        category: Category.FOOD,
        name: 'bread',
        currentStock: 5,
        restaurantId: "1",
        inventoryId: "food#1#1",
        price: 10,
        supplier: JSON.stringify({
            name: 'bread supplier',
            description: 'bread supplier description'
        })
    }, {
        category: Category.BEVERAGES,
        name: 'bread',
        currentStock: 5,
        restaurantId: "1",
        inventoryId: "beverages#1#1",
        price: 10,
        supplier: JSON.stringify({
            name: 'beverages supplier',
            description: 'beverages supplier description'
        })
    }]
    beforeEach(() => {
        spyInventoryDiscountServiceFindAll.mockReset();
    });
    beforeAll(() => {
        AWSMock.setSDKInstance(AWS);
    });
    afterAll(() => {
        AWSMock.restore('DynamoDB.DocumentClient');
    })
    test('create method should return inventory model', async () => {
        // eslint-disable-next-line @typescript-eslint/ban-types
        AWSMock.mock('DynamoDB.DocumentClient', 'put', (params: PutItemInput, callback: Function) => {
            callback(null, {});
        });
        
        const input : InventoryReqDto = {
            category: Category.FOOD,
            name: 'bread',
            current_stock: 5,
            restaurant_id: "1",
            price: 10,
            supplier: {
                name: 'bread supplier',
                description: 'bread supplier description'
            }
        }
        const inventoryService = jest.requireActual('../../src/services/InventoryService').default
        const invetoryModel: InventoryModel = await inventoryService.create(input)
        expect(invetoryModel.name).toBe(input.name);
        expect(invetoryModel.price).toBe(input.price);
        expect(invetoryModel.currentStock).toBe(input.current_stock);
        expect(invetoryModel.supplier).toBe(input.supplier);
        expect(invetoryModel.restaurantId).toBe(input.restaurant_id);
    });

    test('findById method return null, matched inventory id not found', async () => {
        // eslint-disable-next-line @typescript-eslint/ban-types
        AWSMock.mock('DynamoDB.DocumentClient', 'get', (params: GetItemInput, callback: Function) => {
            callback(null, {Item: null});
        });
        
        const inventoryService = jest.requireActual('../../src/services/InventoryService').default
        const inventory = await inventoryService.findById("1")
        expect(inventory).toBe(null)
    });
    it('findById method should return matched inventory model without discount', async () => {
        const expected = defaultInvetory
        // eslint-disable-next-line @typescript-eslint/ban-types
        AWSMock.remock('DynamoDB.DocumentClient', 'get', (params: GetItemInput, callback: Function) => {
            callback(null, {Item: expected});
        });
        spyInventoryDiscountServiceFindAll.mockImplementation(() => Promise.resolve([]))
        
        const inventoryService = jest.requireActual('../../src/services/InventoryService').default
        const inventory = await inventoryService.findById("food#1#1")
        expect(inventory.inventoryId).toBe(expected.inventoryId)
        expect(inventory.name).toBe(expected.name)
        expect(inventory.price).toBe(expected.price)
    });

    test('findById method should return matched inventory model with discount specific category 10%', async () => {
        const expected = defaultInvetory
        // eslint-disable-next-line @typescript-eslint/ban-types
        AWSMock.remock('DynamoDB.DocumentClient', 'get', (params: GetItemInput, callback: Function) => {
            callback(null, {Item: expected});
        });
        spyInventoryDiscountServiceFindAll.mockImplementation(() => Promise.resolve([
            new InventoryDiscountModel(Category.FOOD, 10)
        ]))
        
        const inventoryService = jest.requireActual('../../src/services/InventoryService').default
        const inventory = await inventoryService.findById("food#1#1")
        expect(inventory.toResponse().price).toBe(9)
    });
    test('findById method should return matched inventory model with discount all category 20%', async () => {
        const expected = defaultInvetory
        // eslint-disable-next-line @typescript-eslint/ban-types
        AWSMock.remock('DynamoDB.DocumentClient', 'get', (params: GetItemInput, callback: Function) => {
            callback(null, {Item: expected});
        });
        spyInventoryDiscountServiceFindAll.mockImplementation(() => Promise.resolve([
            new InventoryDiscountModel(CATEGORY_ALL, 20)
        ]))
        
        const inventoryService = jest.requireActual('../../src/services/InventoryService').default
        const inventory = await inventoryService.findById("food#1#1")
        expect(inventory.toResponse().price).toBe(8)
    });

    test('findAll method should return list inventory model without discount', async () => {
        const expected = defaultInventories
        // eslint-disable-next-line @typescript-eslint/ban-types
        AWSMock.mock('DynamoDB.DocumentClient', 'scan', (params: GetItemInput, callback: Function) => {
            callback(null, {Items: expected});
        });
        spyInventoryDiscountServiceFindAll.mockImplementation(() => Promise.resolve([]))
        
        const inventoryService = jest.requireActual('../../src/services/InventoryService').default
        const inventories = await inventoryService.findAll()
        expect(inventories.data.length).toBe(2)
        for (let index = 0; index < inventories.data.length; index++) {
            expect(inventories.data[index].name).toBe(expected[index].name)
            expect(inventories.data[index].price).toBe(expected[index].price)
            expect(inventories.data[index].inventoryId).toBe(expected[index].inventoryId)
        }
    });

    test('findAll method should return list inventory model with food discount 10% and beverages discount 20%', async () => {
        const expected = defaultInventories
        // eslint-disable-next-line @typescript-eslint/ban-types
        AWSMock.remock('DynamoDB.DocumentClient', 'scan', (params: GetItemInput, callback: Function) => {
            callback(null, {Items: expected});
        });
        spyInventoryDiscountServiceFindAll.mockImplementation(() => Promise.resolve([
            new InventoryDiscountModel(Category.FOOD, 10),
            new InventoryDiscountModel(Category.BEVERAGES, 20),
        ]))
        
        const inventoryService = jest.requireActual('../../src/services/InventoryService').default
        const inventories = await inventoryService.findAll()
        expect(inventories.data.length).toBe(2)
        const expectedPrices = [9, 8]
        for (let index = 0; index < inventories.data.length; index++) {
            const invetoryRes = inventories.data[index].toResponse()
            expect(invetoryRes.name).toBe(expected[index].name)
            expect(invetoryRes.price).toBe(expectedPrices[index])
            expect(invetoryRes.id).toBe(expected[index].inventoryId)
        }
    });

    test('findAll method should return list inventory model with all discount 20%', async () => {
        const expected = defaultInventories
        // eslint-disable-next-line @typescript-eslint/ban-types
        AWSMock.remock('DynamoDB.DocumentClient', 'scan', (params: GetItemInput, callback: Function) => {
            callback(null, {Items: expected});
        });
        spyInventoryDiscountServiceFindAll.mockImplementation(() => Promise.resolve([
            new InventoryDiscountModel(CATEGORY_ALL, 20),
        ]))
        
        const inventoryService = jest.requireActual('../../src/services/InventoryService').default
        const inventories = await inventoryService.findAll()
        expect(inventories.data.length).toBe(2)
        for (let index = 0; index < inventories.data.length; index++) {
            const invetoryRes = inventories.data[index].toResponse()
            expect(invetoryRes.name).toBe(expected[index].name)
            expect(invetoryRes.price).toBe(8)
            expect(invetoryRes.id).toBe(expected[index].inventoryId)
        }
    });

    test('findAll method should return list inventory model with pagination limit 1', async () => {
        const expected = defaultInventories
        const lastKeyExpected = {inventoryId: "beverages#1#1", restaurantId: "1"}
        // eslint-disable-next-line @typescript-eslint/ban-types
        AWSMock.remock('DynamoDB.DocumentClient', 'scan', (params: GetItemInput, callback: Function) => {
            callback(null, {Items: [expected[0]], LastEvaluatedKey: lastKeyExpected});
        });
        spyInventoryDiscountServiceFindAll.mockImplementation(() => Promise.resolve([]))
        
        const inventoryService = jest.requireActual('../../src/services/InventoryService').default
        const inventories = await inventoryService.findAll({

        })
        expect(inventories.data.length).toBe(1)
        expect(inventories.data[0].inventoryId).toBe("food#1#1")
        expect(inventories.lastKey).toBe(lastKeyExpected)
    });
})