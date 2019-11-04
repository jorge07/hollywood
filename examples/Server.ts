import express from 'express'
import Application, { CreateUser, UserSayHello, QueryDemo } from "./CommandAndQueryHandlers"
import { IAppResponse, IAppError } from '../src/Application/Bus/CallbackArg';

const app = express();

app.set('port', 3000);
app.set('env', 'dev');

app.post('/user', (req: any, res: any) => {
    const email = 'lol@lol.com'
    const userUuid = '11a38b9a-b3da-360f-9353-a5a725514269';
    
    Application.handle(new CreateUser(userUuid, email));

    res.json({uuid: userUuid, email});
});

app.post('/user-sync', async (req: any, res: any) => {
    const email = 'lol@lol.com'
    const userUuid = '11a38b9a-b3da-360f-9353-a5a725514269';
    
    await Application.handle(new CreateUser(userUuid, email))
    
    res.json({uuid: userUuid, email});
});

app.get('/hello', async (req: any, res: any) => {
    const response: IAppResponse|IAppError|null = await Application.ask(new QueryDemo()); 
    res.json(response);
});

app.listen(app.get('port'), () => {
    console.log(
        'App is running at http://localhost:%d in %s mode',
        app.get('port'), 
        app.get('env')
    );
});
