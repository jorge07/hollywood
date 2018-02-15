import {Request} from "./Request";

export interface Handler {

    handle(any: Request): void | any
}