import { DomainEvent } from '../../../src/Domain/Event/DomainEvent';

class DemoEvent extends DomainEvent {

}

describe('DomainEvent', () => {

  it('DomainEvent must record when occurs and get child class name', () => {
      const event = new DemoEvent();
      
      expect(event.ocurrendOn).toBeDefined();
  })
})