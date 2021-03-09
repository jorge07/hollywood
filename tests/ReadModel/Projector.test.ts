import EventBus from '../../src/EventSourcing/EventBus/EventBus';
import DomainMessage from '../../src/Domain/Event/DomainMessage';
import {SayWolf} from '../Domain/AggregateRoot.test';
import InMemoryReadModelRepository from "../../src/ReadModel/InMemoryReadModelRepository";
import Projector from "../../src/ReadModel/Projector";

class DogReadModelProjector extends Projector {
    constructor(private readonly repository: InMemoryReadModelRepository) {
        super();
    }

    onSayWolf(event: SayWolf): void {
        this.repository.save(event.uuid, 'Wolf');
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

    it("In Memory repository should fail of not exist", async () => {
        expect.assertions(1);

        const readModel: InMemoryReadModelRepository = new InMemoryReadModelRepository();

        try {
            readModel.oneOrFail('demo');
        } catch (err) {
            expect(err.message).toBe('Not Found');
        }
    });
});
