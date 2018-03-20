"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("../../../src/Application/");
const DemoHandlers_1 = require("./DemoHandlers");
describe("HandlerResolver test suite", () => {
    it("It should routing to correct handler", () => {
        const resolver = new _1.HandlerResolver();
        const demoHandler = new DemoHandlers_1.DemoHandler();
        resolver
            .addHandler(DemoHandlers_1.DemoCommand, demoHandler)
            .addHandler(DemoHandlers_1.DemoQuery, new DemoHandlers_1.DemoQueryHandler());
        const caller = (command, callback) => {
            resolver.resolve(command, callback);
        };
        caller(new DemoHandlers_1.DemoQuery(), (result) => expect(result).toBe("Hello!"));
        caller(new DemoHandlers_1.DemoCommand(), (res) => (expect(res.data).toBe('ack')));
        expect(demoHandler.received).toBeTruthy();
    });
});
//# sourceMappingURL=Resolver.test.js.map