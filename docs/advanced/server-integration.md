# Server Integration

Hollywood integrates with any HTTP framework. This guide covers Express and Fastify.

## Express Integration

Build your Kernel and pass it to your HTTP server:

```typescript
import type { Application, Framework } from "hollywood-js";
import express from "express";
import bodyParser from "body-parser";
import { CreateUser, FindUser } from "./app";

export class HTTP {
    private readonly express;

    constructor(private readonly kernel: Framework.Kernel) {
        this.express = express();
        this.express.use(bodyParser.json());
    }

    bindRouter(app: Application.App) {
        this.express.get("/user/:uuid", async (request, res) => {
            try {
                const user = await app.ask(new FindUser(request.params.uuid));
                res.send(user);
            } catch (err) {
                res.status(404).send();
            }
        });

        this.express.post("/user", async (request, res) => {
            await app.handle(new CreateUser(request.body.uuid, request.body.username));
            res.send();
        });
    }

    async up() {
        this.bindRouter(this.kernel.app);
        this.express.listen(3000, (err) => {
            if (err) throw err;
            console.info("Server listening on http://localhost:3000");
        });
    }
}
```

## Fastify Integration

```typescript
import type { Framework } from "hollywood-js";
import Fastify from "fastify";
import { CreateUser, FindUser } from "./app";

export async function createServer(kernel: Framework.Kernel) {
    const fastify = Fastify({ logger: true });

    fastify.get("/user/:uuid", async (request, reply) => {
        try {
            const { uuid } = request.params as { uuid: string };
            const user = await kernel.app.ask(new FindUser(uuid));
            return user;
        } catch (err) {
            reply.code(404).send({ error: "Not found" });
        }
    });

    fastify.post("/user", async (request, reply) => {
        const { uuid, username } = request.body as { uuid: string; username: string };
        await kernel.app.handle(new CreateUser(uuid, username));
        reply.code(201).send();
    });

    return fastify;
}

// Start server
(async () => {
    const kernel = await KernelFactory();
    const server = await createServer(kernel);
    await server.listen({ port: 3000 });
})();
```

## Project Structure

```
src/
├── apps/
│   └── http/
│       ├── server.ts
│       └── routes/
│           ├── user.ts
│           └── order.ts
├── modules/
│   ├── user/
│   └── order/
└── kernel.ts
```

## Error Handling

Handle domain errors appropriately:

```typescript
app.post("/user", async (request, res) => {
    try {
        await kernel.app.handle(new CreateUser(request.body.uuid, request.body.username));
        res.status(201).send();
    } catch (err) {
        if (err instanceof InvalidUsername) {
            res.status(400).json({ error: err.message });
        } else if (err instanceof UserAlreadyExists) {
            res.status(409).json({ error: "User already exists" });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});
```

## Middleware

Use framework middleware for cross-cutting concerns:

```typescript
// Express middleware
app.use(async (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });
    next();
});
```

## Full Example

See the examples directory for complete implementations:
- [Express Example](https://github.com/jorge07/hollywood/tree/master/examples/guide/chapter-4/express)
- [Fastify Example](https://github.com/jorge07/hollywood/tree/master/examples/guide/chapter-4/fastify)
- [Billing API](https://github.com/jorge07/billing-api/tree/master/src/Apps/HTTP) - Production-ready example

---

**Next:** Explore the [Architecture Overview](../architecture/overview.md)
