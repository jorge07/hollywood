# Adding a Server to your app.

Some examples about how to add a Server to consumer your App are in the examples guide folder:

- [Express](https://github.com/jorge07/hollywood/tree/master/examples/guide/chapter-4/express)
- [Fastify](https://github.com/jorge07/hollywood/tree/master/examples/guide/chapter-4/fastify)

I plan to add other examples like gRPC.

# Express Example

Build your **Kernel** and pass it to your http server and decide the context of your controllers.

Express example:

```typescript
import type {Application, Framework} from 'hollywood-js';
import express from "express";
import {CreateUser, FindUser} from "./app";
import bodyParser from 'body-parser';

export class HTTP {
    private readonly express
    constructor(private readonly kernel: Framework.Kernel) {
        this.express = express();
        this.express.use(bodyParser.json())
    }

    bindRouter(app: Application.App) {
        this.express.get('/user/:uuid', async function get(request: any, res) {
            try {
                const user = await app.ask(new FindUser(request.params.uuid));
                res.send(user);
            } catch (err) {
                res.status(404).send();
            }
        });

        this.express.post('/user', async function post(request, res) {
            await app.handle(new CreateUser(request.body.uuid, request.body.username));
            res.send();
        })
    }

    async up() {
        this.bindRouter(this.kernel.app)
        this.express.listen(3000, (err) => {
            if (err) throw err
            console.info(`server listening on http://localhost:3000`)
        })
    }
}
```

> For a more elaborated example see [here](https://github.com/jorge07/billing-api/tree/master/src/Apps/HTTP)
