"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
});
app.post('/user-sync', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = 'lol@lol.com';
    const userUuid = '11a38b9a-b3da-360f-9353-a5a725514269';
    yield CommandAndQueryHandlers_1.default.handle(new CommandAndQueryHandlers_1.CreateUser(userUuid, email));
    res.json({ uuid: userUuid, email });
}));
app.get('/hello', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield CommandAndQueryHandlers_1.default.ask(new CommandAndQueryHandlers_1.QueryDemo());
    res.json(response);
}));
app.listen(app.get('port'), () => {
    console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
});
//# sourceMappingURL=Server.js.map