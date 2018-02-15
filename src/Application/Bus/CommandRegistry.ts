import {Handler} from "./Handler";

export interface CommandRegistry {
    [key: string]: Handler;
}
