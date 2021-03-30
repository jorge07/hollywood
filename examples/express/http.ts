import {Framework} from 'hollywood-js';
import express from "express";
import {CreateUser, FindUser} from "./app";
import bodyParser from 'body-parser';

export class HTTP {
    private readonly app
    constructor(private readonly kernel: Framework.Kernel) {
        this.app = express();
        this.app.use(bodyParser.json())
    }

    bindRouter() {
        this.app.get('/user/:uuid', async (request: any, res) => {
            try {
                const user = await this.kernel.app.ask(new FindUser(request.params.uuid));
                res.send(user);
            } catch (err) {
                res.status(404).send();
            }
        });

        this.app.post('/user', async (request, res) => {
            await this.kernel.app.handle(new CreateUser(request.body.uuid, request.body.username));
            res.send();
        })
    }

    async up() {
        this.bindRouter()
        this.app.listen(3000, (err) => {
            if (err) throw err
            // this.fastify.log.info(`server listening on ${address}`)
        })
    }
}

