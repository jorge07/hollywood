import 'reflect-metadata';
import { ServiceList } from '../../../src/Framework/Container/Items/Service';
import { AsyncContainerModule, Container, inject, multiInject, interfaces } from 'inversify';
import { Parameter } from '../../../src/Framework/Container/Items/Parameter';
import serviceBinder from '../../../src/Framework/Container/ServiceBinder';
import EventBus from '../../../src/EventStore/EventBus/EventBus';
import DomainEvent from '../../../src/Domain/Event/DomainEvent';
import EventSubscriber from '../../../src/EventStore/EventBus/EventSubscriber';
import { DomainMessage } from '../../../src/Domain';
import EventListener from '../../../src/EventStore/EventBus/EventListener';

class TestEvent extends DomainEvent {

}

class Sub extends EventSubscriber {

    public hit: number = 0;

    protected async onTestEvent(event: TestEvent): Promise<void> {
        this.hit++;
    }
}

class Listener extends EventListener {

    public hit: number = 0;

    public on(event: DomainMessage): void {
        this.hit++;
    }
}

class Single {
    hi() {
        return 'hi';
    }
}

class Wrap {
    constructor(@inject('single') public readonly single: Single) {}
}

class Registry {
    constructor(@multiInject('multi') public readonly multi: []) {}
}

describe("Framework:Container:ServiceBinder", () => { 
    it("Should be able to add a basic services to the container and build the relations", async () => {
        expect.assertions(3);

        const services: ServiceList = new Map([
            ['single', {instance: Single}],
            ['wrap', {instance: Wrap}],
        ]);

        const container = new Container();
        await serviceBinder(container, services);

        expect(container.get('single')).toBeInstanceOf(Single);
        expect(container.get('wrap')).toBeInstanceOf(Wrap);
        expect((container.get('wrap') as Wrap).single.hi()).toEqual('hi');
    });

    it("Should be able to multi inject resources", async () => {
        expect.assertions(1);

        const services: ServiceList = new Map([
            ['multi', { collection: [Single, Single] }],
            ['registry', {instance: Registry}],
        ]);

        const container = new Container();
        await serviceBinder(container, services);

        expect((container.get('registry') as Registry).multi.length).toEqual(2);
    });

    it("Should be able to generate async services", async () => {
        expect.assertions(2);

        const asyncFactory = async () => {
            return 1;
        }

        const asyncFactoryClass = async () => {
            return new Single();
        }

        const services: ServiceList = new Map([
            ['async', { async: asyncFactory }],
            ['async-class', { async: asyncFactoryClass }],
        ]);

        const container = new Container();
        await serviceBinder(container, services);

        expect(container.get('async')).toEqual(1);
        expect(container.get('async-class')).toBeInstanceOf(Single);
    });
    it("Should be able to generate custom, container requried, services", async () => {
        expect.assertions(1);

        const containerAwarefactory = ( { container }: interfaces.Context) => {
            
            return new Wrap(container.get<Single>('single'));
        }

        const services: ServiceList = new Map([
            ['single', { instance: Single }],
            ['containerAwareFactory', { custom: containerAwarefactory }],
        ]);

        const container = new Container();
        await serviceBinder(container, services);

        expect(container.get('containerAwareFactory')).toBeInstanceOf(Wrap);
    });
    it("Should be able to attach listener|subscriber to a bus", async () => {
        expect.assertions(2);

        const services: ServiceList = new Map([
            ['event-bus', { 
                instance: EventBus 
            }],
            ['subscriber', { 
                instance: Sub, 
                bus: "event-bus", 
                subscriber: [
                    TestEvent
                ] 
            }],
            ['listener', { 
                instance: Listener, 
                bus: "event-bus", 
                listener: true
            }],
        ]);

        const container = new Container();
        await serviceBinder(container, services);

        await container.get<EventBus>('event-bus').publish(DomainMessage.create("1", 0, new TestEvent()));

        expect(container.get<Sub>('subscriber').hit).toEqual(1);
        expect(container.get<Sub>('listener').hit).toEqual(1);
    });
});
