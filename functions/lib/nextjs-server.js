"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextjsServer = void 0;
const https_1 = require("firebase-functions/v2/https");
const url_1 = require("url");
const next_1 = __importDefault(require("next"));
const dev = process.env.NODE_ENV !== 'production';
const app = (0, next_1.default)({ dev, conf: { distDir: '.next' } });
const handle = app.getRequestHandler();
exports.nextjsServer = (0, https_1.onRequest)(async (req, res) => {
    try {
        const parsedUrl = (0, url_1.parse)(req.url || '', true);
        // Log da requisição
        console.log(`[NextJS Server] ${req.method} ${parsedUrl.pathname}`);
        // Configurar headers CORS
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') {
            res.status(200).send('');
            return;
        }
        // Preparar o app Next.js
        await app.prepare();
        // Processar com Next.js usando o request original
        await handle(req, res);
    }
    catch (error) {
        console.error('[NextJS Server] Erro:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
//# sourceMappingURL=nextjs-server.js.map