import type { IAppError, IAppResponse } from "../CallbackArg";
import type IQuery from "./Query";

export default interface IQueryHandler {
    handle(request: IQuery): Promise<IAppResponse|IAppError>;
}
