import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { InventoryDiscountReqDto } from "../dto/InventoryDiscountReqDto";
import { CATEGORY_ALL } from "../models/Inventory"
import { InventoryDiscountModel } from "../models/InventoryDiscount";
import { documentClient } from '../commons/dynamodb'

export interface IInventoryDiscountService {
    findAll() : Promise<InventoryDiscountModel[]>
    upsert(input: InventoryDiscountReqDto) : Promise<InventoryDiscountModel>
}

class InventoryDiscountService implements IInventoryDiscountService {
    private table = 'InventoryDiscountsTable'
    private db: DocumentClient = documentClient
    private pk1 = 'category'

    async findAll() : Promise<InventoryDiscountModel[]> {
        const data = await this.db
            .scan({
                TableName: this.table,
            })
            .promise()
        if (!data.Items) {
            return [];
        }
        return data.Items.map((item) => new InventoryDiscountModel(
            item.category,
            item.discount
        ))
    }

    async upsert(input: InventoryDiscountReqDto) : Promise<InventoryDiscountModel> {
        const data = new InventoryDiscountModel(
            input.category ? input.category : CATEGORY_ALL,
            input.discount
        )
        const getResponse = await this.db
            .get({
                TableName: this.table,
                Key: {
                    [this.pk1]: data.category
                }
            }).promise()
        
        if(getResponse.Item){
            await this.db
                .update({
                    TableName: this.table,
                    Key: {
                        [this.pk1]: data.category
                    },
                    UpdateExpression: "set discount = :discount",
                    ExpressionAttributeValues: {
                        ":discount": data.discount
                    }
                })
                .promise()
        } else {
            await this.db
                .put({
                    TableName: this.table,
                    Item: data,
                })
                .promise()
        }
        
        return data
    }
}

export default new InventoryDiscountService()