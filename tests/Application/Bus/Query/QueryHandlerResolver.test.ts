import QueryHandlerResolver from "../../../../src/Application/Bus/Query/QueryResolver";
import QueryBus from "../../../../src/Application/Bus/Query/QueryBus";
import IQuery from "../../../../src/Application/Bus/Query/Query";
import IQueryHandler from "../../../../src/Application/Bus/Query/QueryHandler";
import { IAppResponse, QueryBusResponse } from "../../../../src/Application/Bus/CallbackArg";
import IMiddleware, { NextMiddleware } from "../../../../src/Application/Bus/Middleware";
import MissingAutowiringAnnotationException from "../../../../src/Application/Bus/Exception/MissingAutowiringAnnotationException";
import autowiring from "../../../../src/Application/Bus/autowiring";

// Type-safe mock for the next middleware function
const createMockNext = (): NextMiddleware<IQuery, QueryBusResponse> =>
    jest.fn().mockResolvedValue(null);

// Test query classes
class GetUserQuery implements IQuery {
    constructor(public readonly userId: string) {}
}

class SearchUsersQuery implements IQuery {
    constructor(public readonly searchTerm: string) {}
}

// Test handler classes with autowiring
class GetUserHandler implements IQueryHandler {
    @autowiring
    async handle(query: GetUserQuery): Promise<IAppResponse> {
        return {
            data: { userId: query.userId, name: "Test User" },
            meta: []
        };
    }
}

class SearchUsersHandler implements IQueryHandler {
    @autowiring
    async handle(query: SearchUsersQuery): Promise<IAppResponse> {
        return {
            data: { results: [], searchTerm: query.searchTerm },
            meta: []
        };
    }
}

// Handler without autowiring decorator for testing validation
class HandlerWithoutAutowiring implements IQueryHandler {
    async handle(query: GetUserQuery): Promise<IAppResponse> {
        return { data: null, meta: [] };
    }
}

describe("QueryHandlerResolver", () => {
    describe("autowiring validation", () => {
        it("should throw MissingAutowiringAnnotationException when handler lacks @autowiring decorator", () => {
            const resolver = new QueryHandlerResolver();
            const handlerWithoutAutowiring = new HandlerWithoutAutowiring();

            expect(() => {
                resolver.addHandler(GetUserQuery, handlerWithoutAutowiring);
            }).toThrow(MissingAutowiringAnnotationException);
        });

        it("should include helpful error message with handler class and method name", () => {
            const resolver = new QueryHandlerResolver();
            const handlerWithoutAutowiring = new HandlerWithoutAutowiring();

            expect(() => {
                resolver.addHandler(GetUserQuery, handlerWithoutAutowiring);
            }).toThrow(/HandlerWithoutAutowiring\.handle/);
        });

        it("should include instructions on how to fix the issue", () => {
            const resolver = new QueryHandlerResolver();
            const handlerWithoutAutowiring = new HandlerWithoutAutowiring();

            expect(() => {
                resolver.addHandler(GetUserQuery, handlerWithoutAutowiring);
            }).toThrow(/@autowiring/);
        });

        it("should accept handler with proper @autowiring decorator", () => {
            const resolver = new QueryHandlerResolver();
            const handler = new GetUserHandler();

            expect(() => {
                resolver.addHandler(GetUserQuery, handler);
            }).not.toThrow();
        });
    });

    describe("handler registration", () => {
        it("should register a handler for a query", () => {
            const resolver = new QueryHandlerResolver();
            const handler = new GetUserHandler();

            const result = resolver.addHandler(GetUserQuery, handler);

            // addHandler should return the resolver for chaining
            expect(result).toBe(resolver);
        });

        it("should support fluent registration of multiple handlers", () => {
            const resolver = new QueryHandlerResolver();
            const getUserHandler = new GetUserHandler();
            const searchHandler = new SearchUsersHandler();

            const result = resolver
                .addHandler(GetUserQuery, getUserHandler)
                .addHandler(SearchUsersQuery, searchHandler);

            expect(result).toBe(resolver);
        });
    });

    describe("query resolution", () => {
        it("should resolve and execute the correct handler for a query", async () => {
            const resolver = new QueryHandlerResolver();
            const handler = new GetUserHandler();
            resolver.addHandler(GetUserQuery, handler);

            const query = new GetUserQuery("user-123");
            const result = await resolver.execute(query, createMockNext());

            expect(result).toBeDefined();
            expect((result as IAppResponse).data).toEqual({
                userId: "user-123",
                name: "Test User"
            });
        });

        it("should resolve different handlers for different queries", async () => {
            const resolver = new QueryHandlerResolver();
            const getUserHandler = new GetUserHandler();
            const searchHandler = new SearchUsersHandler();

            resolver.addHandler(GetUserQuery, getUserHandler);
            resolver.addHandler(SearchUsersQuery, searchHandler);

            const userResult = await resolver.execute(new GetUserQuery("user-1"), createMockNext()) as IAppResponse;
            const searchResult = await resolver.execute(new SearchUsersQuery("test"), createMockNext()) as IAppResponse;

            expect((userResult.data as any).userId).toBe("user-1");
            expect((searchResult.data as any).searchTerm).toBe("test");
        });
    });

    describe("missing handler behavior", () => {
        it("should return null when no handler is registered", async () => {
            const resolver = new QueryHandlerResolver();
            const query = new GetUserQuery("user-123");

            const result = await resolver.execute(query, createMockNext());

            expect(result).toBeNull();
        });

        it("should not throw when handler is missing", async () => {
            const resolver = new QueryHandlerResolver();
            const query = new GetUserQuery("user-123");

            await expect(resolver.execute(query, createMockNext())).resolves.toBeNull();
        });
    });

    describe("terminal middleware behavior", () => {
        it("should NOT call next() as it is a terminal handler", async () => {
            const resolver = new QueryHandlerResolver();
            const handler = new GetUserHandler();
            resolver.addHandler(GetUserQuery, handler);

            let nextCalled = false;
            const next: NextMiddleware<IQuery, QueryBusResponse> = async () => {
                nextCalled = true;
                return null;
            };

            await resolver.execute(new GetUserQuery("user-1"), next);

            // The resolver is terminal - it should NOT call next
            expect(nextCalled).toBe(false);
        });
    });

    describe("integration with QueryBus", () => {
        it("should handle queries through QueryBus", async () => {
            const resolver = new QueryHandlerResolver();
            const handler = new GetUserHandler();

            resolver.addHandler(GetUserQuery, handler);

            const queryBus = new QueryBus(resolver);
            const result = await queryBus.ask(new GetUserQuery("user-123")) as IAppResponse;

            expect((result.data as any).userId).toBe("user-123");
        });

        it("should return null from QueryBus when no handler exists", async () => {
            const resolver = new QueryHandlerResolver();
            const queryBus = new QueryBus(resolver);

            const result = await queryBus.ask(new GetUserQuery("user-123"));

            expect(result).toBeNull();
        });
    });
});
