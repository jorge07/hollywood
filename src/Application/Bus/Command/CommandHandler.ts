import { IHandler } from "../Handler";
import { ICommand } from "./Command";

export interface ICommandHandler extends IHandler {

    handle(command: ICommand): void;
}
