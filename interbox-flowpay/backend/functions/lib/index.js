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
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const webhook_1 = require("./flowpay/webhook");
const api_1 = require("./flowpay/api");
admin.initializeApp();
const db = admin.firestore();
const app = (0, express_1.default)();
// Middleware para permitir CORS em desenvolvimento
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
app.use(express_1.default.json());
// Endpoint principal do webhook
app.post('/flowpay/webhook', async (req, res) => {
    try {
        await (0, webhook_1.processFlowPayWebhook)(req, res, db);
    }
    catch (error) {
        console.error('Erro no webhook:', error);
        res.status(500).send('Erro interno');
    }
});
// Endpoint de saúde
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// Endpoint de teste para criar cobrança
app.post('/test/charge', async (req, res) => {
    try {
        const { correlationID, value, comment } = req.body;
        if (!correlationID || !value) {
            return res.status(400).json({ error: 'correlationID e value são obrigatórios' });
        }
        const config = {
            apiKey: process.env.OPENPIX_API_KEY || 'test-key',
            baseUrl: process.env.OPENPIX_BASE_URL || 'https://api.openpix.com.br'
        };
        const api = new api_1.FlowPayAPI(config);
        const charge = await api.createCharge({
            correlationID,
            value,
            comment: comment || 'Teste de cobrança'
        });
        return res.status(200).json(charge);
    }
    catch (error) {
        console.error('Erro ao criar cobrança de teste:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Endpoint de teste para verificar status
app.get('/test/status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const config = {
            apiKey: process.env.OPENPIX_API_KEY || 'test-key',
            baseUrl: process.env.OPENPIX_BASE_URL || 'https://api.openpix.com.br'
        };
        const api = new api_1.FlowPayAPI(config);
        const status = await api.getChargeStatus(id);
        res.status(200).json(status);
    }
    catch (error) {
        console.error('Erro ao verificar status:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Endpoint de teste para simular webhook
app.post('/test/webhook-simulate', async (req, res) => {
    try {
        const { correlationID, status = 'COMPLETED' } = req.body;
        if (!correlationID) {
            return res.status(400).json({ error: 'correlationID é obrigatório' });
        }
        // Simular payload do webhook
        const webhookPayload = {
            status,
            correlationID,
            charge: {
                reference: correlationID,
                status: status,
                value: 2990, // R$ 29,90 em centavos
                createdAt: new Date().toISOString()
            }
        };
        // Processar webhook
        await (0, webhook_1.processFlowPayWebhook)({ body: webhookPayload }, res, db);
        return res.status(200).json({
            message: 'Webhook simulado com sucesso',
            correlationID,
            status
        });
    }
    catch (error) {
        console.error('Erro ao simular webhook:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Endpoint para listar dados de teste
app.get('/test/data', async (req, res) => {
    try {
        const teamsSnapshot = await db.collection('teams').limit(5).get();
        const audiovisualSnapshot = await db.collection('audiovisual').limit(5).get();
        const teams = teamsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        const audiovisual = audiovisualSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json({
            teams,
            audiovisual,
            totalTeams: teams.length,
            totalAudiovisual: audiovisual.length
        });
    }
    catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Endpoint para limpar dados de teste
app.delete('/test/cleanup', async (req, res) => {
    try {
        const { collection, id } = req.body;
        if (!collection || !id) {
            return res.status(400).json({ error: 'collection e id são obrigatórios' });
        }
        await db.collection(collection).doc(id).delete();
        return res.status(200).json({
            message: 'Documento removido com sucesso',
            collection,
            id
        });
    }
    catch (error) {
        console.error('Erro ao limpar dados:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Endpoint de informações do sistema
app.get('/info', (req, res) => {
    res.status(200).json({
        name: 'Interbox FlowPay Backend',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        endpoints: {
            webhook: '/flowpay/webhook',
            health: '/health',
            testCharge: '/test/charge',
            testStatus: '/test/status/:id',
            testWebhook: '/test/webhook-simulate',
            testData: '/test/data',
            testCleanup: '/test/cleanup',
            info: '/info'
        }
    });
});
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map