import EventSourcedAggregateRoot from "../../src/Domain/EventSourcedAggregateRoot";
import EventSourced from "../../src/Domain/EventSourced";
import type DomainEvent from "../../src/Domain/Event/DomainEvent";
import DomainMessage from "../../src/Domain/Event/DomainMessage";
import DomainEventStream from "../../src/Domain/Event/DomainEventStream";
import { Identity } from "../../src/Domain/AggregateRoot";

export class Dog extends EventSourcedAggregateRoot {
    public wolfCount: number = 0;
    private readonly voiceRecorder: VoiceRecorder;
    constructor(id: Identity = Identity.fromString('00000000-0000-4000-8000-000000000041')) {
        super(id);
        this.registerChildren(this.voiceRecorder = new VoiceRecorder());
        this.registerHandler(SayWolf, (event) => this.onSayWolf(event));
        this.registerHandler(SayGrr, (event) => this.onSayGrr(event));
    }

    public sayWolf(): string {
        super.raise(new SayWolf(this.getAggregateRootId().toString()));

        return "Wolf!";
    }

    public sayGrr(): string {
        super.raise(new SayGrr(this.getAggregateRootId().toString()));

        return "Grr!";
    }

    private onSayWolf(event: SayWolf) {
        this.wolfCount++;
    }

    private onSayGrr(event: SayGrr) {
        // No-op for now
    }

    public records(): string[] {
        const recorder: VoiceRecorder = this.getChildEntities()[0] as any;

        return recorder.recorded;
    }

    public translations(): string[] {
        return this.voiceRecorder.getTranslations();
    }
}

// tslint:disable-next-line:max-classes-per-file
class VoiceRecorder extends EventSourced {
    public recorded: string[] = [];
    private readonly translator: Translator;
    constructor() {
        super();
        this.registerChildren(this.translator = new Translator());
        this.registerHandler(SayWolf, (event) => this.onSayWolf(event));
        this.registerHandler(SayGrr, (event) => this.onSayGrr(event));
    }

    private onSayWolf(event: SayWolf) {
        this.recorded.push('Wolf');
    }

    private onSayGrr(event: SayGrr) {
        // No-op for now
    }

    public getTranslations(): string[] {
        return this.translator.translations;
    }
}

// tslint:disable-next-line:max-classes-per-file
class Translator extends EventSourced {
    public translations: string[] = [];

    constructor() {
        super();
        this.registerHandler(SayWolf, (event) => this.onSayWolf(event));
        this.registerHandler(SayGrr, (event) => this.onSayGrr(event));
    }

    private onSayWolf(event: SayWolf) {
        this.translations.push('Hey dude!');
    }

    private onSayGrr(event: SayGrr) {
        this.translations.push('I. Don\'t. Like. That... RUN!');
    }
}

// tslint:disable-next-line:max-classes-per-file
export class SayWolf implements DomainEvent {
    constructor(
        public readonly aggregateId: string,
        public readonly occurredAt: Date = new Date()
    ) {}
}

// tslint:disable-next-line:max-classes-per-file
export class SayGrr implements DomainEvent {
    constructor(
        public readonly aggregateId: string,
        public readonly occurredAt: Date = new Date()
    ) {}
}

describe("AggregateRoot", () => {

    it("Aggregate Roots must store events and call registered event handlers", () => {
        const dog = new Dog(Identity.fromString('00000000-0000-4000-8000-000000000031'));
        let stream = dog.getUncommittedEvents();

        expect(stream.events.length).toBe(0);
        expect(dog.wolfCount).toBe(0);

        expect(dog.sayWolf()).toBe("Wolf!");
        expect(dog.wolfCount).toBe(1);
        expect(dog.records().length).toBe(1);
        expect(dog.translations().length).toBe(1);

        stream = dog.getUncommittedEvents();
        expect(stream.events.length).toBe(1);
    });

    it("Aggregate Roots must be able to reconstruct from stringify events", () => {

        const dog = new Dog(Identity.fromString('00000000-0000-4000-8000-000000000031'));
        const domainMessage: string = JSON.stringify(DomainMessage.create(dog.getAggregateRootId().toString(), 1, new SayWolf('asd')));
        const stream = new DomainEventStream([JSON.parse(domainMessage) as DomainMessage]);
        const pluto = dog.fromHistory(stream) as Dog;

        expect(pluto.getUncommittedEvents().events.length).toBe(0);

        expect(pluto.wolfCount).toBe(1);
        expect(dog.records().length).toBe(1);
    });

    it("Aggregate Roots must be able to reconstruct from events history", () => {
        const dog = new Dog(Identity.fromString('00000000-0000-4000-8000-000000000031'));
        const stream = new DomainEventStream([DomainMessage.create(dog.getAggregateRootId().toString(), 1, new SayWolf('asd'))]);

        const pluto = dog.fromHistory(stream) as Dog;

        expect(pluto.getUncommittedEvents().events.length).toBe(0);

        expect(pluto.wolfCount).toBe(1);
    });

    it("Aggregate Roots can be created from an snapshot", () => {
        const dog = new Dog(Identity.fromString('00000000-0000-4000-8000-000000000031'));

        const snapshot: EventSourced = { version: 2, wolfCount: 2, children:[{recorded:["wolf"]}]} as any
        dog.fromSnapshot(snapshot);
        expect(dog.wolfCount).toBe(2);
        expect(dog.version).toBe(2);
        expect(dog.version).toBe(2);
        expect(dog.records().length).toBe(1);
        expect(dog.getUncommittedEvents().events.length).toBe(0);
    });
});
