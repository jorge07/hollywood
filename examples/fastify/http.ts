import {Application, Framework} from 'hollywood-js';
import {FastifyInstance} from "fastify/types/instance";
import {CreateUser, FindUser} from "./app";

export class HTTP {
    private readonly fastify: FastifyInstance
    constructor(private readonly kernel: Framework.Kernel) {
        this.fastify = require('fastify')({
            logger: false
        });
    }

    bindRouter(app: Application.App) {
        const userSchema =  {
            type: 'object',
            properties: {
                uuid: { type: 'string' },
                username: { type: 'string' }
            }
        };

        const response = {
            schema: {
                response: {
                    200: userSchema
                }
            }
        };

        this.fastify.get('/user/:uuid', response, async function get(request: any, reply) {
            try {
                reply.send(await app.ask(new FindUser(request.params.uuid)));
            } catch (err) {
                reply.status(404).send();
            }
        })

        const createUserOptions = {
            schema: {
                body: userSchema
            }
        };
        this.fastify.post('/user', createUserOptions, async function post(request: any, reply) {
            await app.handle(new CreateUser(request.body.uuid, request.body.username));
            reply.send();
        })
    }

    async up() {
        this.bindRouter(this.kernel.app);
        this.fastify.listen(3000, (err: Error, address: string) => {
            if (err) throw err
            this.fastify.log.info(`server listening on ${address}`)
        })
    }
}

