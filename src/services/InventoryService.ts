import AWS from 'aws-sdk';
import { v4 } from "uuid"
import { HttpError, httpStatusCodes } from "../commons/http";
import { InventoryReqDto } from "../dto/InventoryReqDt";
import { CATEGORY_ALL, InventoryModel } from "../models/Inventory"
import inventoryDiscountService from "./InventoryDiscountService";

export interface IInventoryService {
    findById(id: string) : Promise<InventoryModel>
    create(input: InventoryReqDto) : Promise<InventoryModel>
    findAll() : Promise<InventoryModel[]>
}
class InventoryService implements IInventoryService {
    private table = 'InventoriesTable'
    private db: AWS.DynamoDB.DocumentClient = new AWS.DynamoDB.DocumentClient()
    private pk1 = 'restaurantId'
    private sk1 = 'inventoryId'

    async findById(id: string) : Promise<InventoryModel> {
        const data = await this.db
            .get({
                TableName: this.table,
                Key: {
                    [this.pk1]: id,
                },
            })
            .promise()
        if (!data.Item) {
            throw new HttpError(httpStatusCodes.NOT_FOUND, { error: "not found" });
        }
        const inventory = data.Item
        const inventoryData = new InventoryModel(
            inventory.restaurantId,
            inventory.inventoryId,
            inventory.name,
            inventory.currentStock as number,
            inventory.price as number,
            JSON.parse(inventory.supplier),
        )
        const category = inventoryData.getCategory()
        const inventoryDiscounts = await inventoryDiscountService.findAll()
        const inventoryDiscountMap: {[key: string]: number} = {}
        inventoryDiscounts.forEach((inventoryDiscount) => {
            inventoryDiscountMap[inventoryDiscount.category] = inventoryDiscount.discount
        })
        if(Object.prototype.hasOwnProperty.call(inventoryDiscountMap, category) || Object.prototype.hasOwnProperty.call(inventoryDiscountMap, CATEGORY_ALL)){
            inventoryData.discount = inventoryDiscountMap[category] ? inventoryDiscountMap[category] : inventoryDiscountMap[CATEGORY_ALL]
        }

        return inventoryData
    }

    async findAll() : Promise<InventoryModel[]> {
        const data = await this.db
            .scan({
                TableName: this.table,
            })
            .promise()
        if (!data.Items) {
            return [];
        }
        // discount mapper
        const inventoryDiscounts = await inventoryDiscountService.findAll()
        const inventoryDiscountMap: {[key: string]: number} = {}
        inventoryDiscounts.forEach((inventoryDiscount) => {
            inventoryDiscountMap[inventoryDiscount.category] = inventoryDiscount.discount
        })

        return data.Items.map((inventory) => {
            const inventoryData = new InventoryModel(
                inventory.restaurantId,
                inventory.inventoryId,
                inventory.name,
                inventory.currentStock,
                inventory.price,
                inventory.supplier,
            )
            const category = inventoryData.getCategory()
            if(Object.prototype.hasOwnProperty.call(inventoryDiscountMap, category) || Object.prototype.hasOwnProperty.call(inventoryDiscountMap, CATEGORY_ALL)){
                inventoryData.discount = inventoryDiscountMap[category] ? inventoryDiscountMap[category] : inventoryDiscountMap[CATEGORY_ALL]
            }
            return inventoryData
        })
    }

    async create(input: InventoryReqDto) : Promise<InventoryModel> {
        const data = new InventoryModel(
            input.restaurantId,
            `${input.category}#${v4()}`,
            input.name,
            input.currentStock,
            input.price,
            input.supplier,
        );
        
        await this.db
            .put({
                TableName: this.table,
                Item: data.toObject(),
            })
            .promise()
        
        return data
    }
}

export default new InventoryService()