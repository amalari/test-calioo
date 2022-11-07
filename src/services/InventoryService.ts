import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { v4 } from "uuid"
import { InventoryReqDto } from "../dto/InventoryReqDt";
import { CATEGORY_ALL, InventoryModel } from "../models/Inventory"
import inventoryDiscountService from "./InventoryDiscountService";
import { documentClient } from '../commons/dynamodb'

export interface IInventoryService {
    findById(id: string) : Promise<InventoryModel | null>
    create(input: InventoryReqDto) : Promise<InventoryModel>
    findAll() : Promise<InventoryModel[]>
}
class InventoryService implements IInventoryService {
    private table = 'InventoriesTable'
    private db: DocumentClient = documentClient
    private pk1 = 'restaurantId'
    private sk1 = 'inventoryId'

    async findById(id: string) : Promise<InventoryModel | null> {
        const arrId = id.split('#')
        const data = await this.db
            .get({
                TableName: this.table,
                Key: {
                    [this.pk1]: arrId[2],
                    [this.sk1]: id,
                },
                ConsistentRead: true
            })
            .promise()
        if (!data.Item) {
            return null
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
                JSON.parse(inventory.supplier),
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
            input.restaurant_id,
            `${input.category}#${v4()}#${input.restaurant_id}`,
            input.name,
            input.current_stock,
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