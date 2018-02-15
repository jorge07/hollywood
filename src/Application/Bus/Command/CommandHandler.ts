import {Command} from "./Command";
import {Handler} from "../Handler";

export interface CommandHandler extends Handler{

    handle(command: Command): void
}
