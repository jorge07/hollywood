import {Query} from "./Query";
import {Handler} from "../Handler";

export interface QueryHandler extends Handler{
    handle(query: Query): Promise<any>
}