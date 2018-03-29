"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const CommandAndQueryHandlers_1 = require("./CommandAndQueryHandlers");
const app = express();
app.set('port', 3000);
app.set('env', 'dev');
app.post('/user', (req, res) => {
    const email = 'lol@lol.com';
    const userUuid = '11a38b9a-b3da-360f-9353-a5a725514269';
    CommandAndQueryHandlers_1.default.handle(new CommandAndQueryHandlers_1.CreateUser(userUuid, email));
    res.json({ uuid: userUuid, email });
    console.log('CLIENT LIBERATED');
});
app.post('/user-sync', (req, res) => {
    const email = 'lol@lol.com';
    const userUuid = '11a38b9a-b3da-360f-9353-a5a725514269';
    CommandAndQueryHandlers_1.default.handle(new CommandAndQueryHandlers_1.CreateUser(userUuid, email), (appResponse) => {
        res.json({ uuid: userUuid, email, appResponse });
        console.log('CLIENT LIBERATED');
    });
});
app.get('/hello', (req, res) => {
    CommandAndQueryHandlers_1.queryBus.handle(new CommandAndQueryHandlers_1.QueryDemo()).then((response) => {
        res.json(response);
    });
});
app.listen(app.get('port'), () => {
    console.log(('App is running at http://localhost:%d in %s mode'), app.get('port'), app.get('env'));
});
//# sourceMappingURL=Server.js.map