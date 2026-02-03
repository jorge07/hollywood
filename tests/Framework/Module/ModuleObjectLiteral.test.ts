import { Container } from "inversify";
import { DemoHandler } from "../../Application/Bus/DemoHandlers";
import ModuleContext from "../../../src/Framework/Modules/ModuleContext";
import type { IService } from "../../../src/Framework/Container/Items/Service";

describe("Framework:Module with Object Literal Syntax", () => {
    it("Module should accept object literal services", async () => {
        const module = new ModuleContext({
            services: {
                'test': { instance: DemoHandler }
            }
        });
        expect(module.config).toBeInstanceOf(Object);
    });

    it("Module should register object literal services into Container", async () => {
        const module = new ModuleContext({
            services: {
                'test': { instance: DemoHandler }
            }
        });
        const container = new Container();
        await module.load(container);
        expect(container.get('test')).toBeInstanceOf(DemoHandler);
    });

    it("Module should still accept Map services (backward compatibility)", async () => {
        const services = new Map<string, IService>([
            ['test', { instance: DemoHandler }]
        ]);
        const module = new ModuleContext({ services });
        const container = new Container();
        await module.load(container);
        expect(container.get('test')).toBeInstanceOf(DemoHandler);
    });

    it("Module with nested modules should work with object literal", async () => {
        const moduleA = new ModuleContext({
            services: {
                'testA': { instance: DemoHandler }
            }
        });
        const moduleB = new ModuleContext({
            services: {
                'testB': { instance: DemoHandler }
            },
            modules: [moduleA]
        });

        const container = new Container();
        await moduleB.load(container);

        expect(container.get('testA')).toBeInstanceOf(DemoHandler);
        expect(container.get('testB')).toBeInstanceOf(DemoHandler);
    });

    it("Module with commands should work with object literal", async () => {
        const module = new ModuleContext({
            commands: [DemoHandler],
            services: {
                'test': { instance: DemoHandler }
            }
        });

        const container = new Container();
        await module.load(container);

        expect(container.get('test')).toBeInstanceOf(DemoHandler);
    });
});
