import { IHandler } from "./Handler";

export interface ICommandRegistry {
    [key: string]: IHandler;
}
