"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const Domain = __importStar(require("./src/Domain"));
exports.Domain = Domain;
const Application = __importStar(require("./src/Application/index"));
exports.Application = Application;
const EventStore = __importStar(require("./src/EventStore"));
exports.EventStore = EventStore;
const ReadModel = __importStar(require("./src/ReadModel"));
exports.ReadModel = ReadModel;
const Framework = __importStar(require("./src/Framework"));
exports.Framework = Framework;
//# sourceMappingURL=index.js.map