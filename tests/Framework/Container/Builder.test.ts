import "reflect-metadata";
import DomainMessage from "../../../src/Domain/Event/DomainMessage";
import ModuleContext from "../../../src/Framework/Modules/ModuleContext";
import {BuildFromModuleContext} from "../../../src/Framework/Container/Builder";
import type {IService, Constructor} from "../../../src/Framework/Container/Items/Service";
import ContainerCompilationException from "../../../src/Framework/Container/Exception/ContainerCompilationException";
import EventListener from "../../../src/EventSourcing/EventBus/EventListener";
import {SERVICES_ALIAS} from "../../../src/Framework/Container/Bridge/Alias";
import AppBuilder from "../../../src/Framework/AppBuilder";
import {DemoQueryHandler} from "../../Application/Bus/DemoHandlers";
import {decorate, inject, injectable} from "inversify";
import {EventBus, EventStore} from "../../../src/EventSourcing";
import {Dog, SayWolf} from '../../Domain/AggregateRoot.test';
import {autowiring, ICommand, ICommandHandler} from "../../../src/Application";
import {IAppError} from "../../../src/Application/Bus/CallbackArg";
import { Identity } from "../../../src/Domain/AggregateRoot";

class EchoListener extends EventListener {
    public counter = 0;
    public on(message: DomainMessage): void | Promise<void> {
        this.counter++;
    }
}

// tslint:disable-next-line:max-classes-per-file
class SayWolfCommand implements ICommand {}

// tslint:disable-next-line:max-classes-per-file
class SayWolfHandler implements ICommandHandler {
    constructor(
        private readonly store: EventStore<Dog>) {
    }
    @autowiring
    async handle(command: SayWolfCommand): Promise<void | IAppError> {
        const dog = new Dog(Identity.fromString('00000000-0000-4000-8000-000000000001'));
        dog.sayWolf();
         await this.store.save(dog);
    }
}

decorate(injectable(), SayWolfHandler);
decorate(inject('dog.eventStore') as ParameterDecorator, SayWolfHandler, 0);

// tslint:disable-next-line:no-big-function
describe("Framework:Container", () => {
    it("Builder should be able to register a StandardType and bind ListenersTypes", async () => {
        const services = new Map([
            ["dog.eventStore", {
                eventStore: Dog
            }],
            // tslint:disable-next-line:no-duplicate-string
            ["generic.listener", {
                instance: EchoListener,
                bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
                listener: true
            }],
        ]);

        const testModule = new ModuleContext({services, commands: [SayWolfHandler]});

        const container = await BuildFromModuleContext(new Map(), testModule);

        const listener = container.get<EchoListener>('generic.listener');

        const app = AppBuilder(container);
        await app.handle(new SayWolfCommand());

        expect(listener.counter).toBe(1);
    });
    it("Builder should be able to register a ListenersTypes as Subscriber", async () => {
        const services = new Map([
            ["dog.eventStore", {
                eventStore: Dog
            }],
            ["generic.subscriber", {
                instance: EchoListener,
                bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
                subscriber: [
                    SayWolf
                ]
            }],
            ["generic.subscriber.2", {
                instance: EchoListener,
                bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
                subscriber: [
                    SayWolf
                ]
            }],
            ["global.listener", {
                instance: EchoListener,
                bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
                listeners: true
            }],
        ]);

        const testModule = new ModuleContext({services, commands: [SayWolfHandler], queries: [DemoQueryHandler]});

        const container = await BuildFromModuleContext(new Map(), testModule);

        const listener = container.get<EchoListener>('generic.subscriber');
        const listener2 = container.get<EchoListener>('generic.subscriber.2');

        const app = AppBuilder(container);
        await app.handle(new SayWolfCommand());

        expect(listener.counter).toBe(1);
        expect(listener2.counter).toBe(1);
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
            AppBuilder(container);
        } catch (error) {
            expect((error as Error).message).toContain('Bus doesn\'t exists ')
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
            AppBuilder(container);
        } catch (error) {
            expect((error as Error).message).toContain('Missing bus parameter in ServiceDefinition ')
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
    it("Container Builder throw an error for invalid services", async () => {
        expect.assertions(1);

        // Intentionally pass invalid data to test error handling
        // Use type assertion to bypass TypeScript check for this test case
        const services = new Map<string, IService>([
            [SERVICES_ALIAS.COMMAND_HANDLERS, {
                instance: 1 as unknown as Constructor
            }],
        ]);

        const testModule = new ModuleContext({services});

        try {
            await BuildFromModuleContext(new Map(), testModule);
        }catch (error) {
            expect(error).toBeInstanceOf(ContainerCompilationException)
        }
    });
    it("Container Builder should allow overwrite services", async () => {
        expect.assertions(1);

        // tslint:disable-next-line:max-classes-per-file
        class Noop {}
        const services = new Map<string, IService>([
            [SERVICES_ALIAS.DEFAULT_EVENT_STORE_DBAL, {
                instance: Noop
            }],
        ]);

        const testModule = new ModuleContext({services});

        const container = await BuildFromModuleContext(new Map(), testModule);

        const noopInstance = container.get<Noop>(SERVICES_ALIAS.DEFAULT_EVENT_STORE_DBAL);

        expect(noopInstance).toBeInstanceOf(Noop);
    });
    it("Container Builder should allow overwrite services definition", async () => {
        expect.assertions(14);

        // tslint:disable-next-line:max-classes-per-file
        @injectable()
        class Yep {}
        // tslint:disable-next-line:max-classes-per-file
        @injectable()
        class Noop {}
        const testServices = new Map<string, IService>([
            ['test.collection', {
                collection: [Noop],
            }],
            ['test.instance', {
                instance: Noop,
            }],
            [SERVICES_ALIAS.DEFAULT_EVENT_BUS, {
                instance: EventBus,
            }],
            ['test.async', {
                async: async () => (new Noop()),
            }],
            ['test.custom', {
                custom: () => (new Noop()),
            }],
            ['test.listener', {
                instance: Noop,
                bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
                overwrite: true,
                listener: true,
            }],
            ['test.subscriber', {
                instance: Noop,
                bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
                overwrite: true,
                subscriber: [Yep],
            }],
        ]);
        const mainServices = new Map<string, IService>([
            ['test.collection', {
                collection: [Yep],
                overwrite: true
            }],
            ['test.instance', {
                instance: Yep,
                overwrite: true
            }],
            [SERVICES_ALIAS.DEFAULT_EVENT_BUS, {
                instance: EventBus,
                overwrite: true
            }],
            ['test.async', {
                async: async () => (new Yep()),
                overwrite: true
            }],
            ['test.custom', {
                custom: () => (new Yep()),
                overwrite: true
            }],
            ['test.listener', {
                instance: Yep,
                bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
                overwrite: true,
                listener: true,
            }],
            ['test.subscriber', {
                instance: Yep,
                bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
                overwrite: true,
                subscriber: [],
            }],
        ]);

        const mainModule = new ModuleContext({ services: mainServices});
        const testModule = new ModuleContext({ services: testServices, modules: [ mainModule ] });

        const containerMain = await BuildFromModuleContext(new Map(), mainModule);
        const containerTest = await BuildFromModuleContext(new Map(), testModule);

        expect(containerMain.get('test.collection')).toBeInstanceOf(Yep);
        expect(containerTest.get('test.collection')).toBeInstanceOf(Noop);
        expect(containerMain.get('test.instance')).toBeInstanceOf(Yep);
        expect(containerTest.get('test.instance')).toBeInstanceOf(Noop);
        expect(containerMain.get('test.async')).toBeInstanceOf(Yep);
        expect(containerTest.get('test.async')).toBeInstanceOf(Noop);
        expect(containerMain.get('test.custom')).toBeInstanceOf(Yep);
        expect(containerTest.get('test.custom')).toBeInstanceOf(Noop);
        expect(containerMain.get('test.listener')).toBeInstanceOf(Yep);
        expect(containerTest.get('test.listener')).toBeInstanceOf(Noop);
        expect(containerMain.get('test.subscriber')).toBeInstanceOf(Yep);
        expect(containerTest.get('test.subscriber')).toBeInstanceOf(Noop);
        expect(containerMain.get(SERVICES_ALIAS.DEFAULT_EVENT_BUS)).toBeInstanceOf(EventBus);
        expect(containerTest.get(SERVICES_ALIAS.DEFAULT_EVENT_BUS)).toBeInstanceOf(EventBus);
    });
});
