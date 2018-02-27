import { IHandler } from "../Handler";
import { IQuery } from "./Query";

export interface IQueryHandler extends IHandler {
    handle(query: IQuery): Promise<any>;
}
