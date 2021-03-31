import type { IAppError, IAppResponse } from "../CallbackArg";
import type IQuery from "./Query";
import type IHandler from "../IHandler";
export default interface IQueryHandler extends IHandler {
    handle(request: IQuery): Promise<IAppResponse | IAppError>;
}
