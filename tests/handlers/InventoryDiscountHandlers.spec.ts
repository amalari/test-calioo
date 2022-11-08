import { Category } from '../../src/models/Inventory';
import inventoryDiscountService from '../../src/services/InventoryDiscountService'
import { putInventoryDiscount } from '../../src/handlers/InventoryDiscountHandlers'
import { APIGatewayProxyEvent } from 'aws-lambda';
import { httpStatusCodes } from '../../src/commons/http';
import { InventoryDiscountReqDto } from '../../src/dto/InventoryDiscountReqDto';
import { InventoryDiscountModel } from '../../src/models/InventoryDiscount';

describe('InventoryDiscountHandlers', () => {
    const defaultInventoryDiscounts = [{
        category: Category.FOOD,
        discount: 10,
    }, {
        category: Category.BEVERAGES,
        discount: 20,
    }]
    const headers = {"content-type": "application/json"}
    
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test('"upsertInventoryDiscount handler" should return created inventory discount', async () => {
        const inventoryDiscount = defaultInventoryDiscounts[0]
        const createdData = {
            category: inventoryDiscount.category,
            discount: inventoryDiscount.discount,
        }
        const input: InventoryDiscountReqDto = {
            category: inventoryDiscount.category,
            discount: inventoryDiscount.discount,
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
        const retrieveDataSpy = jest.spyOn(inventoryDiscountService, 'upsert').mockResolvedValueOnce(new InventoryDiscountModel(
            inventoryDiscount.category,
            inventoryDiscount.discount,
        ));
        const actualValue = await putInventoryDiscount(mEvent as unknown as APIGatewayProxyEvent);
        expect(actualValue).toEqual(mResponse);
        expect(retrieveDataSpy).toBeCalledWith(input);
    });

    test('"upsertInventoryDiscount handler" should return input validation error discount should not greater than 100', async () => {
        const inventoryDiscount = defaultInventoryDiscounts[0]
        const input: InventoryDiscountReqDto = {
            category: inventoryDiscount.category,
            discount: 110,
        }
        const mResponse = { 
            statusCode: httpStatusCodes.BAD_REQUEST,
            headers,
            body: JSON.stringify({
                errors: ["discount must be less than or equal to 100"]
            })
        };
        const mEvent = {
            body: JSON.stringify(input)
        };
        const actualValue = await putInventoryDiscount(mEvent as unknown as APIGatewayProxyEvent);
        expect(actualValue).toEqual(mResponse);
    });
})