import EventBus from '../../src/EventStore/EventBus/EventBus';
import { UserWasCreated } from '../../examples/User';
import Projector from '../../src/ReadModel/Projector';
import InMemoryReadModelRepository from '../../src/ReadModel/InMemoryReadModelRepository';
import DomainMessage from '../../src/Domain/Event/DomainMessage';

class UserReadModelProjector extends Projector {
    constructor(private readonly repository: InMemoryReadModelRepository){
        super();
    }

    onUserWasCreated(event: UserWasCreated): void {
        this.repository.save(event.uuid, event.email);
    }
}

describe("Projector", () => {
    it("It should receive an Domain Message and store a Projection", async () => {
        const readModel: InMemoryReadModelRepository = new InMemoryReadModelRepository();

        const eventBus: EventBus = new EventBus();

        eventBus.attach(UserWasCreated, new UserReadModelProjector(readModel));

        eventBus.publish(DomainMessage.create('demo', 0, new UserWasCreated('demo', 'kk@demo.com')));

        expect(readModel.oneOrFail('demo')).toBe('kk@demo.com')
    });

    it("In Memory repository should fail of not exist", async () => {
        const readModel: InMemoryReadModelRepository = new InMemoryReadModelRepository();

        try {
            readModel.oneOrFail('demo');
            expect(1).toThrow('this should never be executed');
        } catch (err) {
            expect(err.message).toBe('Not Found');
        }
    });
});
