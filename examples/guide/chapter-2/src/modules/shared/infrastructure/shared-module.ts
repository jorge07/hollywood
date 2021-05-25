import {Framework} from "hollywood-js";
import Log from "./audit/logger";

const services = (new Map())
    .set("logger", { instance: Log })
;
export const SharedModule = new Framework.ModuleContext({
    services,
});
