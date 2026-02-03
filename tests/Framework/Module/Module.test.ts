import type { IService } from "../../../src/Framework/Container/Items/Service";
import { Container} from "inversify";
import { DemoHandler } from "../../Application/Bus/DemoHandlers";
import ModuleContext from "../../../src/Framework/Modules/ModuleContext";

describe("Framework:Module", () => {
    it("Module should create a ContainerModule", async () => {
        const services = new Map<string,IService>([
            [ 'test', { instance: DemoHandler } ],
        ]);
        const module = new ModuleContext({services})
        expect(module.config).toBeInstanceOf(Object);
    });
    it("Module register service into ContainerModule", async () => {
        const services = new Map<string,IService>([
            [ 'test', { instance: DemoHandler } ],
        ]);
        const module = new ModuleContext({services})
        const container = new Container();
        await module.load(container);
        expect(container.get('test')).toBeInstanceOf(DemoHandler)
    });
    it("ModuleContext dependencies should be initialised only when required", async () => {
        expect.assertions(4)

        const servicesA = new Map<string,IService>([
            [ 'testA', { instance: DemoHandler } ],
        ]);
        const moduleA = new ModuleContext({services: servicesA})
        const servicesB = new Map<string,IService>([
            [ 'testB', { instance: DemoHandler } ],
        ]);
        const moduleB = new ModuleContext({services: servicesB, modules: [moduleA]})
        const containerA = new Container();
        await moduleA.load(containerA);
        const containerB = new Container();
        await moduleB.load(containerB);

        expect(containerA.get('testA')).toBeInstanceOf(DemoHandler);
        expect(() => containerA.get('testB')).toThrow(new Error('No matching bindings found for serviceIdentifier: testB'));

        expect(containerB.get('testB')).toBeInstanceOf(DemoHandler);
        expect(containerB.get('testB')).toBeInstanceOf(DemoHandler);
    });
});
