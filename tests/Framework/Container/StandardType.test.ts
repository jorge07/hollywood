import "reflect-metadata";
import { injectable } from "inversify";
import ModuleContext from "../../../src/Framework/Modules/ModuleContext";
import { BuildFromModuleContext } from "../../../src/Framework/Container/Builder";
import type { IService } from "../../../src/Framework/Container/Items/Service";

@injectable()
class ServiceA {
    public readonly name = "ServiceA";
}

@injectable()
class ServiceB {
    public readonly name = "ServiceB";
}

describe("Framework:Container:StandardType", () => {
    it("should bind service once when registering for the first time", async () => {
        const services = new Map<string, IService>([
            ["test.service", {
                instance: ServiceA
            }]
        ]);

        const testModule = new ModuleContext({ services });
        const container = await BuildFromModuleContext(new Map(), testModule);

        const service = container.get<ServiceA>("test.service");
        expect(service).toBeInstanceOf(ServiceA);
        expect(service.name).toBe("ServiceA");
    });

    it("should rebind service when registering same key twice with overwrite", async () => {
        const firstServices = new Map<string, IService>([
            ["test.service", {
                instance: ServiceA,
                overwrite: true
            }]
        ]);

        const secondServices = new Map<string, IService>([
            ["test.service", {
                instance: ServiceB,
                overwrite: true
            }]
        ]);

        const firstModule = new ModuleContext({ services: firstServices });
        const secondModule = new ModuleContext({ services: secondServices, modules: [firstModule] });

        const container = await BuildFromModuleContext(new Map(), secondModule);

        // secondModule's services take precedence over its dependencies (firstModule)
        const service = container.get<ServiceA | ServiceB>("test.service");
        expect(service).toBeInstanceOf(ServiceB);
        expect(service.name).toBe("ServiceB");
    });

    it("should not throw errors when binding or rebinding services", async () => {
        const services = new Map<string, IService>([
            ["test.first", {
                instance: ServiceA
            }],
            ["test.second", {
                instance: ServiceB,
                overwrite: true
            }]
        ]);

        const testModule = new ModuleContext({ services });

        await expect(BuildFromModuleContext(new Map(), testModule)).resolves.not.toThrow();

        const container = await BuildFromModuleContext(new Map(), testModule);
        expect(container.get<ServiceA>("test.first")).toBeInstanceOf(ServiceA);
        expect(container.get<ServiceB>("test.second")).toBeInstanceOf(ServiceB);
    });

    it("should allow overwriting a pre-bound service without duplicate binding error", async () => {
        const baseServices = new Map<string, IService>([
            ["shared.service", {
                instance: ServiceA
            }]
        ]);

        const overwriteServices = new Map<string, IService>([
            ["shared.service", {
                instance: ServiceB,
                overwrite: true
            }]
        ]);

        const baseModule = new ModuleContext({ services: baseServices });
        const overwriteModule = new ModuleContext({ services: overwriteServices, modules: [baseModule] });

        const container = await BuildFromModuleContext(new Map(), overwriteModule);

        // overwriteModule's services take precedence over its dependencies (baseModule)
        const service = container.get<ServiceA | ServiceB>("shared.service");
        expect(service).toBeInstanceOf(ServiceB);
    });
});
