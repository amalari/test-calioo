import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { httpStatusCodes } from "../commons/http";
import { InventoryReqDto } from "../dto/InventoryReqDt";
import { InventoryResDto } from "../dto/InventoryResDto";
import inventoryService, { IInventoryService } from "../services/InventoryService";
import { IValidator } from "../validators/BaseInputValidator";
import inventoryInputValidator from "../validators/InventoryInputValidator";
import { BaseHandlers } from "./BaseHandlers";

class InventoryHandlers extends BaseHandlers {
    constructor(
        private service: IInventoryService,
        private validator: IValidator<InventoryReqDto>
    ){
        super()
    }

    async listInventory(): Promise<APIGatewayProxyResult>{
        try {
            const inventories = this.service.findAll()
            return this.handleSuccess(httpStatusCodes.OK, inventories)
        } catch (error) {
            return this.handleError(error)
        }
    }

    async getInventory(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        try {
            const inventory = await this.service.findById(event.pathParameters?.id as string);
            return this.handleSuccess<InventoryResDto>(httpStatusCodes.OK, inventory.toResponse())
        } catch (error) {
            return this.handleError(error)
        }
    }

    async createInventory(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        try {
            const reqBody = JSON.parse(event.body as string);
            this.validator.validate(reqBody)
            const inventory = await this.service.create(reqBody as InventoryReqDto);
            return this.handleSuccess<InventoryResDto>(httpStatusCodes.OK, inventory.toResponse())
        } catch (error) {
            return this.handleError(error)
        }
    }
}

const inventoryHandlers = new InventoryHandlers(inventoryService, inventoryInputValidator)

export default {
    listInventory: inventoryHandlers.listInventory
}