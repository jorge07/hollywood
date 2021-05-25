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

