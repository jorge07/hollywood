"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DemoCommand {
}
exports.DemoCommand = DemoCommand;
class DemoHandler {
    constructor() {
        this.received = false;
    }
    handle(demo, callback) {
        this.received = true;
        callback({ data: 'ack', meta: [] });
    }
}
exports.DemoHandler = DemoHandler;
class DemoQuery {
}
exports.DemoQuery = DemoQuery;
class DemoQueryHandler {
    handle(query) {
        return new Promise(() => ("Hello!"));
    }
}
exports.DemoQueryHandler = DemoQueryHandler;
//# sourceMappingURL=DemoHandlers.js.map