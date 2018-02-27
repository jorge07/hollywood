import { IRequest } from "./Request";

export interface IHandler {

    handle(request: IRequest): void | any;
}
