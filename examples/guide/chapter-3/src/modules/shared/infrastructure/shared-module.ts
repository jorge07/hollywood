import {Framework} from "hollywood-js";
import Log from "./audit/logger";

export const SharedModule = new Framework.ModuleContext({
    services: {
        "logger": { instance: Log }
    }
});
