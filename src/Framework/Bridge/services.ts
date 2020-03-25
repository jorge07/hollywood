import AppBridge from "../AppBridge";
import { IService } from "../Container/Items/Service";

export const bridgeServices: Map<string, IService> = new Map([
    [
        "application.command.handler",
        { collection: []},
    ],
    [
        "application.query.handler",
        { collection: []},
    ],
    [
        "application.command.middleware",
        { collection: [] },
    ],
    [
        "application.query.middleware",
        { collection: [] },
    ],
    [
        "app",
        { instance: AppBridge },
    ],
]);
