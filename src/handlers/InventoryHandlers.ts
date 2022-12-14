import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ValidationError } from "yup";
import { HttpError, httpStatusCodes } from "../commons/http";
import { InventoryReqDto } from "../dto/InventoryReqDto";
import { InventoryResDto } from "../dto/InventoryResDto";
import { InventoryModel } from "../models/Inventory";
import inventoryService, { IInventoryService } from "../services/InventoryService";
import { FindAllInput } from "../services/service";
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

    async listInventory(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>{
        try {
            const params: FindAllInput = { limit: event.queryStringParameters?.limit ? parseInt(event.queryStringParameters?.limit) : 10 }
            if(event.queryStringParameters?.last_key){
                params.lastKey = event.queryStringParameters?.last_key
            }
            const inventories = await this.service.findAll(params)
            return this.handleSuccess<InventoryResDto[]>(
                httpStatusCodes.OK, 
                inventories.data.map((inventory) => inventory.toResponse()), 
                {
                    pagination: {
                        size: params.limit,
                        next: inventories.lastKey,
                        prev: params.lastKey ? JSON.parse(params.lastKey) : null
                    }
                }
            )
        } catch (error) {
            return this.handleError(error)
        }
    }

    async getInventory(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        try {
            if(!InventoryModel.validateId(event.pathParameters?.id as string)) throw new HttpError(httpStatusCodes.BAD_REQUEST, { error: `Invalid Id: ${event.pathParameters?.id as string}` })

            const inventory = await this.service.findById(event.pathParameters?.id as string);
            if(!inventory) throw new HttpError(httpStatusCodes.NOT_FOUND, { error: `Inventory with Id: ${event.pathParameters?.id} Not Found` });

            return this.handleSuccess<InventoryResDto>(httpStatusCodes.OK, inventory.toResponse())
        } catch (error) {
            return this.handleError(error)
        }
    }

    async createInventory(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        try {
            if(!event.body) throw new ValidationError('input cannot be null or empty')
            
            const reqBody = JSON.parse(event.body as string);
            await this.validator.validate(reqBody)
            const inventory = await this.service.create(reqBody as InventoryReqDto);
            return this.handleSuccess<InventoryResDto>(httpStatusCodes.OK, inventory.toResponse())
        } catch (error) {
            return this.handleError(error)
        }
    }
}

const inventoryHandlers = new InventoryHandlers(inventoryService, inventoryInputValidator)

export const listInventory = inventoryHandlers.listInventory.bind(inventoryHandlers)
export const createInventory = inventoryHandlers.createInventory.bind(inventoryHandlers)
export const getInventory = inventoryHandlers.getInventory.bind(inventoryHandlers)