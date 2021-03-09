import "reflect-metadata";
import DomainMessage from "../../../src/Domain/Event/DomainMessage";
import CreateUserHandler from "../../../examples/application/CreateUserHandler";
import User from "../../../examples/domain/User";
import ModuleContext from "../../../src/Framework/Modules/ModuleContext";
import CreateUser from "../../../examples/application/CreateUser";
import {BuildFromModuleContext} from "../../../src/Framework/Container/Builder";
import type {IService} from "../../../src/Framework/Container/Items/Service";
import ContainerCompilationException from "../../../src/Framework/Container/Exception/ContainerCompilationException";
import {UserWasCreated} from "../../../examples/domain/UserWasCreated";
import EventListener from "../../../src/EventStore/EventBus/EventListener";
import {SERVICES_ALIAS} from "../../../src/Framework/Container/Bridge/Alias";
import AppBuilder from "../../../src/Framework/AppBuilder";
import {DemoQueryHandler} from "../../Application/Bus/DemoHandlers";

class EchoListener extends EventListener {
    public counter = 0;
    public on(message: DomainMessage): void | Promise<void> {
        this.counter++;
    }
}

describe("Framework:Container", () => {
    it("Builder should be able to register a StandardType and bind ListenersTypes", async () => {
        const services = new Map([
            ["user.eventStore", {
                eventStore: User
            }],
            // tslint:disable-next-line:no-duplicate-string
            ["generic.subscriber", {
                instance: EchoListener,
                bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
                listener: true
            }],
        ]);

        const testModule = new ModuleContext({services, commands: [CreateUserHandler]});

        const container = await BuildFromModuleContext(new Map(), testModule);

        const listener = container.get<EchoListener>('generic.subscriber');

        const app = new AppBuilder(container);
        await app.handle(new CreateUser("1", "demo@example.org"));

        expect(listener.counter).toBe(1);
    });
    it("Builder should be able to register a ListenersTypes as Subscriber", async () => {
        const services = new Map([
            ["user.eventStore", {
                eventStore: User
            }],
            ["generic.subscriber", {
                instance: EchoListener,
                bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
                subscriber: [
                    UserWasCreated
                ]
            }],
        ]);

        const testModule = new ModuleContext({services, commands: [CreateUserHandler], queries: [DemoQueryHandler]});

        const container = await BuildFromModuleContext(new Map(), testModule);

        const listener = container.get<EchoListener>('generic.subscriber');

        const app = new AppBuilder(container);
        await app.handle(new CreateUser("1", "demo@example.org"));

        expect(listener.counter).toBe(1);
    });
    it("ListenersTypes with invalid Bus should fail", async () => {
        expect.assertions(1);
        const services = new Map([
            ["generic.subscriber", {
                instance: EchoListener,
                bus: 'sorry.I.dont.exist',
                listener: true
            }],
        ]);

        const testModule = new ModuleContext({services});

        try {
            const container = await BuildFromModuleContext(new Map(), testModule);
            // tslint:disable-next-line:no-unused-expression
            new AppBuilder(container);
        } catch (error) {
            expect(error.message).toContain('Bus doesn\'t exists ')
        }
    });
    it("ListenersTypes with missing Bus should fail", async () => {
        expect.assertions(1);
        const services = new Map([
            ["generic.subscriber", {
                instance: EchoListener,
                listener: true
            }],
        ]);

        const testModule = new ModuleContext({services});

        try {
            const container = await BuildFromModuleContext(new Map(), testModule);
            // tslint:disable-next-line:no-unused-expression
            new AppBuilder(container);
        } catch (error) {
            expect(error.message).toContain('Missing bus parameter in ServiceDefinition ')
        }
    });
    it("Container Builder should create an AsyncType", async () => {
        const services = new Map<string, IService>([
            ["test.async", {
                async: async () => (new EchoListener())
            }]
        ]);

        const testModule = new ModuleContext({services});

        const container = await BuildFromModuleContext(new Map(), testModule);

        const listener = container.get<EchoListener>('test.async');

        expect(listener.counter).toBe(0);
    });
    it("Container Builder should create an CustomType", async () => {
        const services = new Map<string, IService>([
            ["test.custom", {
                custom:  () => (new EchoListener())
            }]
        ]);

        const testModule = new ModuleContext({services});

        const container = await BuildFromModuleContext(new Map(), testModule);

        const listener = container.get<EchoListener>('test.custom');

        expect(listener.counter).toBe(0);
    });
    it("Container Builder should create an CustomType", async () => {
        expect.assertions(1);

        const services = new Map<string, IService>([
            [SERVICES_ALIAS.COMMAND_HANDLERS, {
                instance: 1
            }],
        ]);

        const testModule = new ModuleContext({services});

        try {
            await BuildFromModuleContext(new Map(), testModule);
        }catch (error) {
            expect(error).toBeInstanceOf(ContainerCompilationException)
        }
    });
});
