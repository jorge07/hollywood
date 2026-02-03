import CommandHandlerResolver, { CommandResponse } from "../../../../src/Application/Bus/Command/CommandHandlerResolver";
import CommandBus from "../../../../src/Application/Bus/Command/CommandBus";
import ICommand from "../../../../src/Application/Bus/Command/Command";
import ICommandHandler from "../../../../src/Application/Bus/Command/CommandHandler";
import { IAppError } from "../../../../src/Application/Bus/CallbackArg";
import IMiddleware, { NextMiddleware } from "../../../../src/Application/Bus/Middleware";

// Type-safe mock for the next middleware function
const createMockNext = (): NextMiddleware<ICommand, CommandResponse> =>
    jest.fn().mockResolvedValue(undefined);

// Test command classes
class CreateUserCommand implements ICommand {
    constructor(
        public readonly userId: string,
        public readonly email: string
    ) {}
}

class DeleteUserCommand implements ICommand {
    constructor(public readonly userId: string) {}
}

class FailingCommand implements ICommand {
    constructor(public readonly shouldFail: boolean = true) {}
}

// Test handler classes
class CreateUserHandler implements ICommandHandler {
    public handledCommands: CreateUserCommand[] = [];

    async handle(command: CreateUserCommand): Promise<void | IAppError> {
        this.handledCommands.push(command);
    }
}

class DeleteUserHandler implements ICommandHandler {
    public deletedUserIds: string[] = [];

    async handle(command: DeleteUserCommand): Promise<void | IAppError> {
        this.deletedUserIds.push(command.userId);
    }
}

class FailingHandler implements ICommandHandler {
    async handle(command: FailingCommand): Promise<void | IAppError> {
        if (command.shouldFail) {
            throw { code: 500, message: "Handler failed" } as IAppError;
        }
    }
}

// Custom middleware for testing chain behavior
class TrackingMiddleware implements IMiddleware {
    public callCount: number = 0;
    public commands: any[] = [];

    async execute(command: any, next: (command: any) => any): Promise<any> {
        this.callCount++;
        this.commands.push(command);
        return await next(command);
    }
}

describe("CommandHandlerResolver", () => {
    describe("handler registration", () => {
        it("should register a handler for a command", () => {
            const resolver = new CommandHandlerResolver();
            const handler = new CreateUserHandler();

            const result = resolver.addHandler(CreateUserCommand, handler);

            // addHandler should return the resolver for chaining
            expect(result).toBe(resolver);
        });

        it("should support fluent registration of multiple handlers", () => {
            const resolver = new CommandHandlerResolver();
            const createHandler = new CreateUserHandler();
            const deleteHandler = new DeleteUserHandler();

            const result = resolver
                .addHandler(CreateUserCommand, createHandler)
                .addHandler(DeleteUserCommand, deleteHandler);

            expect(result).toBe(resolver);
        });
    });

    describe("command resolution", () => {
        it("should resolve and execute the correct handler for a command", async () => {
            const resolver = new CommandHandlerResolver();
            const handler = new CreateUserHandler();
            resolver.addHandler(CreateUserCommand, handler);

            const command = new CreateUserCommand("user-123", "test@example.com");
            await resolver.execute(command, createMockNext());

            expect(handler.handledCommands).toHaveLength(1);
            expect(handler.handledCommands[0]).toBe(command);
            expect(handler.handledCommands[0].userId).toBe("user-123");
            expect(handler.handledCommands[0].email).toBe("test@example.com");
        });

        it("should resolve different handlers for different commands", async () => {
            const resolver = new CommandHandlerResolver();
            const createHandler = new CreateUserHandler();
            const deleteHandler = new DeleteUserHandler();

            resolver.addHandler(CreateUserCommand, createHandler);
            resolver.addHandler(DeleteUserCommand, deleteHandler);

            await resolver.execute(new CreateUserCommand("user-1", "a@test.com"), createMockNext());
            await resolver.execute(new DeleteUserCommand("user-2"), createMockNext());

            expect(createHandler.handledCommands).toHaveLength(1);
            expect(deleteHandler.deletedUserIds).toHaveLength(1);
            expect(deleteHandler.deletedUserIds[0]).toBe("user-2");
        });
    });

    describe("missing handler behavior", () => {
        it("should return undefined when no handler is registered", async () => {
            const resolver = new CommandHandlerResolver();
            const command = new CreateUserCommand("user-123", "test@example.com");

            const result = await resolver.execute(command, createMockNext());

            expect(result).toBeUndefined();
        });

        it("should not throw when handler is missing", async () => {
            const resolver = new CommandHandlerResolver();
            const command = new CreateUserCommand("user-123", "test@example.com");

            await expect(resolver.execute(command, createMockNext())).resolves.toBeUndefined();
        });
    });

    describe("handler error propagation", () => {
        it("should propagate errors thrown by handlers", async () => {
            const resolver = new CommandHandlerResolver();
            const failingHandler = new FailingHandler();
            resolver.addHandler(FailingCommand, failingHandler);

            const command = new FailingCommand(true);

            await expect(resolver.execute(command, createMockNext())).rejects.toEqual({
                code: 500,
                message: "Handler failed"
            });
        });

        it("should not throw when handler succeeds", async () => {
            const resolver = new CommandHandlerResolver();
            const failingHandler = new FailingHandler();
            resolver.addHandler(FailingCommand, failingHandler);

            const command = new FailingCommand(false);

            await expect(resolver.execute(command, createMockNext())).resolves.toBeUndefined();
        });
    });

    describe("terminal middleware behavior", () => {
        it("should NOT call next() as it is a terminal handler", async () => {
            const resolver = new CommandHandlerResolver();
            const handler = new CreateUserHandler();
            resolver.addHandler(CreateUserCommand, handler);

            let nextCalled = false;
            const next: NextMiddleware<ICommand, CommandResponse> = async () => {
                nextCalled = true;
                return undefined;
            };

            await resolver.execute(new CreateUserCommand("user-1", "test@test.com"), next);

            // The resolver is terminal - it should NOT call next
            expect(nextCalled).toBe(false);
            // But it should still execute the handler
            expect(handler.handledCommands).toHaveLength(1);
        });

        it("should work correctly as last middleware in chain", async () => {
            const trackingMiddleware = new TrackingMiddleware();
            const resolver = new CommandHandlerResolver();
            const handler = new CreateUserHandler();

            resolver.addHandler(CreateUserCommand, handler);

            // Create bus with middleware before resolver
            const commandBus = new CommandBus(trackingMiddleware, resolver);

            const command = new CreateUserCommand("user-1", "test@test.com");
            await commandBus.handle(command);

            // Middleware should be called
            expect(trackingMiddleware.callCount).toBe(1);
            expect(trackingMiddleware.commands[0]).toBe(command);

            // Handler should be executed
            expect(handler.handledCommands).toHaveLength(1);
            expect(handler.handledCommands[0]).toBe(command);
        });

        it("should work with multiple middlewares before resolver", async () => {
            const middleware1 = new TrackingMiddleware();
            const middleware2 = new TrackingMiddleware();
            const resolver = new CommandHandlerResolver();
            const handler = new CreateUserHandler();

            resolver.addHandler(CreateUserCommand, handler);

            const commandBus = new CommandBus(middleware1, middleware2, resolver);

            await commandBus.handle(new CreateUserCommand("user-1", "test@test.com"));

            expect(middleware1.callCount).toBe(1);
            expect(middleware2.callCount).toBe(1);
            expect(handler.handledCommands).toHaveLength(1);
        });
    });

    describe("integration with CommandBus", () => {
        it("should handle commands through CommandBus", async () => {
            const resolver = new CommandHandlerResolver();
            const handler = new CreateUserHandler();

            resolver.addHandler(CreateUserCommand, handler);

            const commandBus = new CommandBus(resolver);
            await commandBus.handle(new CreateUserCommand("user-123", "test@example.com"));

            expect(handler.handledCommands).toHaveLength(1);
        });

        it("should return undefined from CommandBus when no handler exists", async () => {
            const resolver = new CommandHandlerResolver();
            const commandBus = new CommandBus(resolver);

            const result = await commandBus.handle(new CreateUserCommand("user-123", "test@example.com"));

            expect(result).toBeUndefined();
        });

        it("should propagate handler errors through CommandBus", async () => {
            const resolver = new CommandHandlerResolver();
            const failingHandler = new FailingHandler();

            resolver.addHandler(FailingCommand, failingHandler);

            const commandBus = new CommandBus(resolver);

            await expect(commandBus.handle(new FailingCommand(true))).rejects.toEqual({
                code: 500,
                message: "Handler failed"
            });
        });
    });
});
