import "reflect-metadata";
import ICommandHandler from '../../../src/Application/Bus/Command/CommandHandler';
import { IAppError } from '../../../src/Application/Bus/CallbackArg';
import ICommand from '../../../src/Application/Bus/Command/Command';
import autowiring from '../../../src/Application/Bus/autowiring';

class DemoCommand implements ICommand {

}

class DemoHandler implements ICommandHandler {
    @autowiring
    public async handle(command: DemoCommand): Promise<void|IAppError> {
    }
}

describe("Autowirign annotation test suite", () => {
    it("It should modify the object and add the command name", async () => {
        const command = (target: any ) => {
            if (!target.command) {
                throw new Error(`Missinng @autowiring annotation in ${target.constructor.name} command`);
            }

            return target.command;
        };

        const demo: any = new DemoHandler();

        expect(demo.command).toEqual({ name: "DemoCommand" });
    });
});
