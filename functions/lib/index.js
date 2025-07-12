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
exports.onUserCreated = exports.nextjsServer = exports.authenticateUser = void 0;
// Firebase Functions - CERRADØ INTERBOX 2025
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const auth_1 = require("./legacy/middleware/auth");
Object.defineProperty(exports, "authenticateUser", { enumerable: true, get: function () { return auth_1.authenticateUser; } });
const nextjs_server_1 = require("./nextjs-server");
Object.defineProperty(exports, "nextjsServer", { enumerable: true, get: function () { return nextjs_server_1.nextjsServer; } });
const functionsV1 = __importStar(require("firebase-functions/v1"));
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp();
}
// Trigger quando usuário é criado
exports.onUserCreated = functionsV1.auth.user().onCreate(async (user) => {
    try {
        const { uid, email, displayName, photoURL } = user;
        await firebase_admin_1.default.firestore().collection('users').doc(uid).set({
            email,
            displayName,
            photoURL,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'active',
        }, { merge: true });
    }
    catch (error) {
        console.error('Erro ao criar usuário no Firestore:', error);
    }
});
//# sourceMappingURL=index.js.map