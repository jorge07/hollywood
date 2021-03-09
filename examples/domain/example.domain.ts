// ts-node examples/domain/example.domain.ts
import User from './User';

const user = User.create("1", "demo@example.org");

// tslint:disable-next-line:no-console
console.log(user.getUncommittedEvents());
