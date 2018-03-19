import * as express from 'express'
import Bus, { CreateUser, UserSayHello, QueryDemo } from "./CommandAndQueryHandlers"
import { AppResponse } from '../src/Application/Bus/Query/CallbackArg';

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

app.post('/user-sync', (req, res) => {
    const email = 'lol@lol.com'
    const userUuid = '11a38b9a-b3da-360f-9353-a5a725514269';
    
    Bus.handle(new CreateUser(userUuid, email), (appResponse: AppResponse) => {
        res.json({uuid: userUuid, email, appResponse});
        console.log('CLIENT LIBERATED');
    });
});

app.get('/hello', (req, res) => {
    Bus.handle(new QueryDemo(), (response) => {
        res.json(response);
    });
});

app.listen(app.get('port'), () => {
    console.log(('App is running at http://localhost:%d in %s mode'),
    app.get('port'), app.get('env'));
});
