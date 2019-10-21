import { IAppError, IAppResponse } from "../CallbackArg";
import IQuery from "./Query";

export default interface IQueryHandler {
    handle(request: IQuery): Promise<IAppResponse|IAppError>;
}
