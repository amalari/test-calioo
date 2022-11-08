import { InventoryModel } from '../../src/models/Inventory';
import inventoryService from '../../src/services/InventoryService'
import { FindAllOutput } from '../../src/services/service';
import { listInventory, getInventory, createInventory } from '../../src/handlers/InventoryHandlers'
import { APIGatewayProxyEvent } from 'aws-lambda';
import { httpStatusCodes } from '../../src/commons/http';
import { InventoryReqDto } from '../../src/dto/InventoryReqDt';

describe('InventoryHandlers', () => {
    const defaultInventories = [{
        restaurantId: "1",
        inventoryId: "food#1#1",
        name: "meat",
        currentStock: 5,
        price: 10,
        supplier: {
            name: "meat supplier",
            description: "meat supplier description"
        }
    }, {
        restaurantId: "1",
        inventoryId: "beverages#1#1",
        name: "milk",
        currentStock: 5,
        price: 10,
        supplier: {
            name: "milk supplier",
            description: "milk supplier description"
        }
    }]
    const headers = {"content-type": "application/json"}
    
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test('"listInventory handler" should return list inventory data without last key for next page', async () => {
        const inventory = defaultInventories[0]
        const expectedData = [{
            id: inventory.inventoryId,
            category: "food",
            current_stock: inventory.currentStock,
            name: inventory.name,
            price: inventory.price,
            supplier: inventory.supplier,
        }] 
        const findAllReturn: FindAllOutput<InventoryModel[]> = {
            data: [new InventoryModel(
                inventory.restaurantId,
                inventory.inventoryId,
                inventory.name,
                inventory.currentStock,
                inventory.price,
                inventory.supplier,
            )],
            lastKey: null
        }
        const mResponse = { 
            statusCode: httpStatusCodes.OK, 
            body: JSON.stringify({
                data: expectedData,
                meta: {
                    pagination: {
                        size: 10,
                        next: null,
                        prev: null
                    }
                },
            }),
            headers
        };
        const mEvent = {};
        const retrieveDataSpy = jest.spyOn(inventoryService, 'findAll').mockResolvedValueOnce(findAllReturn);
        const actualValue = await listInventory(mEvent as APIGatewayProxyEvent);
        expect(actualValue).toStrictEqual(mResponse);
        expect(retrieveDataSpy).toBeCalled();
    });

    test('"listInventory handler" should return list inventory data with last key for next page', async () => {
        const inventory = defaultInventories[0]
        const expectedData = [{
            id: inventory.inventoryId,
            category: "food",
            current_stock: inventory.currentStock,
            name: inventory.name,
            price: inventory.price,
            supplier: inventory.supplier,
        }] 
        const findAllReturn: FindAllOutput<InventoryModel[]> = {
            data: [new InventoryModel(
                inventory.restaurantId,
                inventory.inventoryId,
                inventory.name,
                inventory.currentStock,
                inventory.price,
                inventory.supplier,
            )],
            lastKey: {
                inventoryId: defaultInventories[0].inventoryId,
                restaurantId: defaultInventories[0].restaurantId,
            }
        }
        const mResponse = { 
            statusCode: httpStatusCodes.OK, 
            body: JSON.stringify({
                data: expectedData,
                meta: {
                    pagination: {
                        size: 1,
                        next: {
                            inventoryId: defaultInventories[0].inventoryId,
                            restaurantId: defaultInventories[0].restaurantId,
                        },
                        prev: null
                    }
                },
            }),
            headers
        };
        const mEvent = {
            queryStringParameters: {
                limit: "1",
            }
        };
        const retrieveDataSpy = jest.spyOn(inventoryService, 'findAll').mockResolvedValueOnce(findAllReturn);
        const actualValue = await listInventory(mEvent as unknown as APIGatewayProxyEvent);
        expect(actualValue).toEqual(mResponse);
        expect(retrieveDataSpy).toBeCalled();
    });

    test('"listInventory handler" should return list inventory data next page', async () => {
        const inventory = defaultInventories[1]
        const expectedData = [{
            id: inventory.inventoryId,
            category: "beverages",
            current_stock: inventory.currentStock,
            name: inventory.name,
            price: inventory.price,
            supplier: inventory.supplier,
        }] 
        const findAllReturn: FindAllOutput<InventoryModel[]> = {
            data: [new InventoryModel(
                inventory.restaurantId,
                inventory.inventoryId,
                inventory.name,
                inventory.currentStock,
                inventory.price,
                inventory.supplier,
            )],
            lastKey: null
        }
        const mResponse = { 
            statusCode: httpStatusCodes.OK, 
            body: JSON.stringify({
                data: expectedData,
                meta: {
                    pagination: {
                        size: 1,
                        next: null,
                        prev: {
                            inventoryId: defaultInventories[0].inventoryId,
                            restaurantId: defaultInventories[0].restaurantId,
                        }
                    }
                },
            }),
            headers
        };
        const mEvent = {
            queryStringParameters: {
                limit: "1",
                last_key: JSON.stringify({
                    inventoryId: defaultInventories[0].inventoryId,
                    restaurantId: defaultInventories[0].restaurantId,
                })
            }
        };
        const retrieveDataSpy = jest.spyOn(inventoryService, 'findAll').mockResolvedValueOnce(findAllReturn);
        const actualValue = await listInventory(mEvent as unknown as APIGatewayProxyEvent);
        expect(actualValue).toEqual(mResponse);
        expect(retrieveDataSpy).toBeCalled();
    });

    test('"getInventory handler" should return invalid id parameter', async () => {
        const mResponse = { 
            statusCode: httpStatusCodes.BAD_REQUEST,
            headers,
            body: JSON.stringify({
                error: 'Invalid Id: 1',
            })
        };
        const mEvent = {
            pathParameters: {
                id: "1"
            }
        };
        const actualValue = await getInventory(mEvent as unknown as APIGatewayProxyEvent);
        expect(actualValue).toEqual(mResponse);
    });

    test('"getInventory handler" should return matched inventory not found', async () => {
        const mResponse = { 
            statusCode: httpStatusCodes.NOT_FOUND,
            headers,
            body: JSON.stringify({
                error: 'Inventory with Id: food#1#2 Not Found',
            })
        };
        const mEvent = {
            pathParameters: {
                id: "food#1#2"
            }
        };
        const retrieveDataSpy = jest.spyOn(inventoryService, 'findById').mockResolvedValueOnce(null);
        const actualValue = await getInventory(mEvent as unknown as APIGatewayProxyEvent);
        expect(actualValue).toEqual(mResponse);
        expect(retrieveDataSpy).toBeCalledWith(mEvent.pathParameters.id);
    });

    test('"getInventory handler" should return matched inventory', async () => {
        const inventory = defaultInventories[0]
        const expectedData = {
            id: inventory.inventoryId,
            category: "food",
            current_stock: inventory.currentStock,
            name: inventory.name,
            price: inventory.price,
            supplier: inventory.supplier,
        }
        const mResponse = { 
            statusCode: httpStatusCodes.OK,
            headers,
            body: JSON.stringify({
                data: expectedData
            })
        };
        const mEvent = {
            pathParameters: {
                id: "food#1#1"
            }
        };
        const retrieveDataSpy = jest.spyOn(inventoryService, 'findById').mockResolvedValueOnce(new InventoryModel(
            inventory.restaurantId,
            inventory.inventoryId,
            inventory.name,
            inventory.currentStock,
            inventory.price,
            inventory.supplier,
        ));
        const actualValue = await getInventory(mEvent as unknown as APIGatewayProxyEvent);
        expect(actualValue).toEqual(mResponse);
        expect(retrieveDataSpy).toBeCalledWith(mEvent.pathParameters.id);
    });

    test('"createInventory handler" should return created inventory', async () => {
        const inventory = defaultInventories[0]
        const createdData = {
            id: inventory.inventoryId,
            category: "food",
            current_stock: inventory.currentStock,
            name: inventory.name,
            price: inventory.price,
            supplier: inventory.supplier,
        }
        const [category] = inventory.inventoryId.split('#')
        const input: InventoryReqDto = {
            restaurant_id: inventory.restaurantId,
            name: inventory.name,
            category,
            current_stock: inventory.currentStock,
            price: inventory.price,
            supplier: inventory.supplier,
        }
        const mResponse = { 
            statusCode: httpStatusCodes.OK,
            headers,
            body: JSON.stringify({
                data: createdData
            })
        };
        const mEvent = {
            body: JSON.stringify(input)
        };
        const retrieveDataSpy = jest.spyOn(inventoryService, 'create').mockResolvedValueOnce(new InventoryModel(
            inventory.restaurantId,
            inventory.inventoryId,
            inventory.name,
            inventory.currentStock,
            inventory.price,
            inventory.supplier,
        ));
        const actualValue = await createInventory(mEvent as unknown as APIGatewayProxyEvent);
        expect(actualValue).toEqual(mResponse);
        expect(retrieveDataSpy).toBeCalledWith(input);
    });

    test('"createInventory handler" should return input validation error', async () => {
        const inventory = defaultInventories[0]
        const [category] = inventory.inventoryId.split('#')
        const input = {
            restaurant_id: inventory.restaurantId,
            name: inventory.name,
            category,
            current_stock: inventory.currentStock,
            price: -10,
            supplier: inventory.supplier,
        }
        const mResponse = { 
            statusCode: httpStatusCodes.BAD_REQUEST,
            headers,
            body: JSON.stringify({
                errors: ["price must be greater than or equal to 0"]
            })
        };
        const mEvent = {
            body: JSON.stringify(input)
        };
        const actualValue = await createInventory(mEvent as unknown as APIGatewayProxyEvent);
        expect(actualValue).toEqual(mResponse);
    });
})