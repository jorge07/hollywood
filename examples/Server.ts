import * as express from 'express'
import Bus, { CreateUser, UserSayHello, QueryDemo, queryBus } from "./CommandAndQueryHandlers"
import { AppResponse, AppError } from '../src/Application/Bus/CallbackArg';

const app = express();

app.set('port', 3000);
app.set('env', 'dev');

app.post('/user', (req, res) => {
    const email = 'lol@lol.com'
    const userUuid = '11a38b9a-b3da-360f-9353-a5a725514269';
    
    Bus.handle(new CreateUser(userUuid, email));

    res.json({uuid: userUuid, email});
    console.log('CLIENT LIBERATED');
});

app.post('/user-sync', async (req, res) => {
    const email = 'lol@lol.com'
    const userUuid = '11a38b9a-b3da-360f-9353-a5a725514269';
    
    await Bus.handle(new CreateUser(userUuid, email))
    
    res.json({uuid: userUuid, email});
    console.log('CLIENT LIBERATED');
});

app.get('/hello', async (req, res) => {
    const response: AppResponse|AppError = await queryBus.ask(new QueryDemo()); 
    res.json(response);
});

app.listen(app.get('port'), () => {
    console.log(('App is running at http://localhost:%d in %s mode'),
    app.get('port'), app.get('env'));
});
