import EventSourcedAggregateRoot from "../../src/Domain/EventSourcedAggregateRoot";
import EventSourced from "../../src/Domain/EventSourced";
import DomainEvent from "../../src/Domain/Event/DomainEvent";
import DomainMessage from "../../src/Domain/Event/DomainMessage";
import DomainEventStream from "../../src/Domain/Event/DomainEventStream";

export class Dog extends EventSourcedAggregateRoot {
    public wolfCount: number = 0;
    constructor(id = '41') {
        super(id);
        this.registerChildren(new VoiceRecorder())
    }

    public sayWolf(): string {
        super.raise(new SayWolf(this.getAggregateRootId() || Math.random().toString()));

        return "Wolf!";
    }

    public sayGrr(): string {
        super.raise(new SayGrr(this.getAggregateRootId() || Math.random().toString()));

        return "Grr!";
    }

    public applySayWolf(event: SayWolf) {
        this.wolfCount++;
    }

    public records(): string[] {
        const recorder: VoiceRecorder = this.getChildEntities()[0] as any;

        return recorder.recorded;
    }
}

// tslint:disable-next-line:max-classes-per-file
class VoiceRecorder extends EventSourced {
    public recorded: string[] = [];
    constructor() {
        super();
        this.registerChildren(new VoiceModifier())
    }

    public applySayWolf(event: SayWolf) {
        this.recorded.push('Wolf');
    }
}

// tslint:disable-next-line:max-classes-per-file
class VoiceModifier extends EventSourced {
    public recorded: string[] = [];

    public applySayWolf(event: SayWolf) {
        this.recorded.push('Wolf');
    }
}

// tslint:disable-next-line:max-classes-per-file
export class SayWolf extends DomainEvent {
    constructor(public readonly uuid: string) {
        super();
    }
}

// tslint:disable-next-line:max-classes-per-file
export class SayGrr extends DomainEvent {
    constructor(public readonly uuid: string) {
        super();
    }
}

describe("AggregateRoot", () => {

    it("Aggregate Roots must store events and call apply<DomainEventName> method if exist", () => {
        const dog = new Dog("31");
        let stream = dog.getUncommittedEvents();

        expect(stream.events.length).toBe(0);
        expect(dog.wolfCount).toBe(0);

        expect(dog.sayWolf()).toBe("Wolf!");
        expect(dog.wolfCount).toBe(1);
        expect(dog.records().length).toBe(1);

        stream = dog.getUncommittedEvents();
        expect(stream.events.length).toBe(1);
    });

    it("Aggregate Roots must be able to reconstruct from stringified events", () => {

        const dog = new Dog("31");
        const domainMessage: string = JSON.stringify(DomainMessage.create(dog.getAggregateRootId(), 1, new SayWolf('asd')));
        const stream = new DomainEventStream([JSON.parse(domainMessage) as DomainMessage]);
        const pluto = dog.fromHistory(stream) as Dog;

        expect(pluto.getUncommittedEvents().events.length).toBe(0);

        expect(pluto.wolfCount).toBe(1);
        expect(dog.records().length).toBe(1);
    });

    it("Aggregate Roots must be able to reconstruct from events history", () => {
        const dog = new Dog("31");
        const stream = new DomainEventStream([DomainMessage.create(dog.getAggregateRootId(), 1, new SayWolf('asd'))]);

        const pluto = dog.fromHistory(stream) as Dog;

        expect(pluto.getUncommittedEvents().events.length).toBe(0);

        expect(pluto.wolfCount).toBe(1);
    });

    it("Aggregate Roots can be created from an snapshot", () => {
        const dog = new Dog("31");

        const snapshot: EventSourced = { version: 2, wolfCount: 2} as any
        dog.fromSnapshot(snapshot);
        expect(dog.wolfCount).toBe(2);
        expect(dog.version).toBe(2);
        expect(dog.getUncommittedEvents().events.length).toBe(0);
    });
});
