"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testFunction = exports.pollMessagesFunction = exports.createSessionFunction = exports.saveFeedbackFunction = exports.getChatHistoryFunction = exports.sendMessageFunction = void 0;
// Firebase Functions - CERRADØ INTERBOX 2025
const functions = __importStar(require("firebase-functions"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// Importar functions do chat
const chat_1 = require("./legacy/chat");
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp();
}
// Exportar functions do chat com nomes corretos para o frontend
exports.sendMessageFunction = chat_1.sendMessage;
exports.getChatHistoryFunction = chat_1.getChatHistory;
exports.saveFeedbackFunction = chat_1.saveFeedback;
exports.createSessionFunction = chat_1.createSession;
exports.pollMessagesFunction = chat_1.pollMessages;
// Função temporária para testar deploy
exports.testFunction = functions.https.onRequest((req, res) => {
    res.json({ message: 'Função temporária funcionando!' });
});
//# sourceMappingURL=index.js.map