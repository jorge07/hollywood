// ts-node examples/domain/example.domain.ts 
import User from './User';

const user = User.create("1", "demo@example.org");

console.log(user.getUncommittedEvents());
