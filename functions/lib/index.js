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
exports.onUserCreated = exports.testFunction = exports.nextjsServer = exports.authenticateUser = void 0;
// Firebase Functions - CERRADØ INTERBOX 2025
const functions = __importStar(require("firebase-functions/v2"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const auth_1 = require("./legacy/middleware/auth");
Object.defineProperty(exports, "authenticateUser", { enumerable: true, get: function () { return auth_1.authenticateUser; } });
const nextjs_server_1 = require("./nextjs-server");
Object.defineProperty(exports, "nextjsServer", { enumerable: true, get: function () { return nextjs_server_1.nextjsServer; } });
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp();
}
// Função temporária para testar deploy
exports.testFunction = functions.https.onRequest((request, response) => {
    response.json({ message: 'Função temporária funcionando!' });
});
// Trigger quando usuário é criado
exports.onUserCreated = functions.auth.onUserCreated(async (event) => {
    const user = event.data;
    try {
        const { uid, email, displayName, photoURL } = user;
        // Criar documento do usuário no Firestore
        const userData = {
            uid,
            email: email || '',
            displayName: displayName || '',
            photoURL: photoURL || '',
            role: 'publico',
            isActive: true,
            cidade: '',
            box: '',
            whatsapp: '',
            telefone: '',
            categoria: 'atleta',
            mensagem: '',
            createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            //  GAMIFICAÇÃO CAMADA 1
            gamification: {
                points: 10,
                level: 'iniciante',
                totalActions: 1,
                lastActionAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
                achievements: ['first_blood'],
                rewards: [],
                streakDays: 1,
                lastLoginStreak: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
                referralCode: `REF${uid.substring(0, 8).toUpperCase()}`,
                referrals: [],
                referralPoints: 0
            }
        };
        await firebase_admin_1.default.firestore().collection('users').doc(uid).set(userData);
        console.log('✅ Usuário criado com sucesso:', { uid, email, displayName });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error('❌ Erro ao criar usuário:', errorMessage);
    }
});
//# sourceMappingURL=index.js.map