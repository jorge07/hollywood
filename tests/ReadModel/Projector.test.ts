import EventBus from '../../src/EventSourcing/EventBus/EventBus';
import DomainMessage from '../../src/Domain/Event/DomainMessage';
import {SayWolf} from '../Domain/AggregateRoot.test';
import InMemoryReadModelRepository from "../../src/ReadModel/InMemoryReadModelRepository";
import EventSubscriber from "../../src/EventSourcing/EventBus/EventSubscriber";
import type Projector from "../../src/ReadModel/Projector";

/**
 * Example projector using EventSubscriber.
 * The Projector type alias provides semantic clarity that this is a read model projector.
 */
class DogReadModelProjector extends EventSubscriber {
    constructor(private readonly repository: InMemoryReadModelRepository) {
        super();
    }

    onSayWolf(event: SayWolf): void {
        this.repository.save(event.aggregateId, 'Wolf');
    }
}

describe("Projector", () => {
    it("It should receive an Domain Message and store a Projection", async () => {
        const readModel: InMemoryReadModelRepository = new InMemoryReadModelRepository();

        const eventBus: EventBus = new EventBus();

        eventBus.attach(SayWolf, new DogReadModelProjector(readModel));

        await eventBus.publish(DomainMessage.create('demo', 0, new SayWolf('demo')));

        expect(readModel.oneOrFail('demo')).toBe('Wolf')
    });

    it("Projector type alias is assignable from EventSubscriber", () => {
        const readModel: InMemoryReadModelRepository = new InMemoryReadModelRepository();

        // Projector is a type alias for EventSubscriber
        // This verifies the type system works correctly
        const projector: Projector = new DogReadModelProjector(readModel);

        expect(projector).toBeInstanceOf(EventSubscriber);
    });

    it("In Memory repository should fail of not exist", async () => {
        expect.assertions(1);

        const readModel: InMemoryReadModelRepository = new InMemoryReadModelRepository();

        try {
            readModel.oneOrFail('demo');
        } catch (err) {
            expect((err as Error).message).toBe('Not Found');
        }
    });
});
