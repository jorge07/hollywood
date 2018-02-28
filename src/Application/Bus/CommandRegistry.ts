import { IHandler } from "./Handler";

export type CommandRegistry = {
    [key: string]: IHandler;
}
