import "reflect-metadata";
import ICommandHandler from '../../../src/Application/Bus/Command/CommandHandler';
import ICommand from '../../../src/Application/Bus/Command/Command';
import autowiring from '../../../src/Application/Bus/autowiring';
import {IAppError} from "../../../src/Application/Bus/CallbackArg";

class DemoCommand implements ICommand {

}
// tslint:disable-next-line:max-classes-per-file
class DemoHandler implements ICommandHandler {
    @autowiring
    // tslint:disable-next-line:no-empty
    public async handle(command: DemoCommand): Promise<void | IAppError> {}
}

describe("Autowiring annotation test suite", () => {
    it("It should modify the object and add the command name", async () => {
        const demo: any = new DemoHandler();

        expect(demo.command).toEqual({name: DemoCommand.name});
    });
});
