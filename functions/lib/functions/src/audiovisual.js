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
exports.criarInscricaoAudiovisual = exports.validaAudiovisual = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const logger_1 = require("./utils/logger");
const axios_1 = __importDefault(require("axios"));
const db = admin.firestore();
exports.validaAudiovisual = functions.https.onCall(async (data, context) => {
    var _a, _b, _c;
    const contextData = { functionName: 'validaAudiovisual', userId: (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid };
    try {
        // Verificar autenticação
        if (!context.auth) {
            logger_1.logger.security('Tentativa de acesso não autenticado', {}, contextData);
            throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
        }
        const { audiovisualId, adminId, aprovado, motivoRejeicao } = data;
        // Verificar se é admin
        const adminUser = await db.collection('users').doc(adminId).get();
        if (!adminUser.exists || ((_b = adminUser.data()) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            logger_1.logger.security('Tentativa de validação por não-admin', { adminId }, contextData);
            throw new functions.https.HttpsError('permission-denied', 'Apenas admins podem validar profissionais audiovisuais');
        }
        // Buscar profissional audiovisual
        const audiovisualRef = db.collection('audiovisual').doc(audiovisualId);
        const audiovisualDoc = await audiovisualRef.get();
        if (!audiovisualDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Profissional audiovisual não encontrado');
        }
        const audiovisualData = audiovisualDoc.data();
        const tipo = (audiovisualData === null || audiovisualData === void 0 ? void 0 : audiovisualData.tipo) || 'fotografo';
        // Atualizar status do profissional audiovisual
        const updateData = {
            status: aprovado ? 'approved' : 'rejected',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (aprovado) {
            updateData.aprovadoPor = adminId;
            updateData.aprovadoEm = admin.firestore.FieldValue.serverTimestamp();
        }
        else {
            updateData.rejeitadoPor = adminId;
            updateData.rejeitadoEm = admin.firestore.FieldValue.serverTimestamp();
            updateData.motivoRejeicao = motivoRejeicao || 'Não especificado';
        }
        await audiovisualRef.update(updateData);
        // Atualizar role do usuário se aprovado
        if (aprovado) {
            await db.collection('users').doc(audiovisualData === null || audiovisualData === void 0 ? void 0 : audiovisualData.userId).update({
                role: tipo, // 'fotografo', 'videomaker', 'editor', etc.
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        // Log da ação
        const logData = {
            adminId,
            adminEmail: (_c = adminUser.data()) === null || _c === void 0 ? void 0 : _c.email,
            acao: aprovado ? 'aprovacao_audiovisual' : 'rejeicao_audiovisual',
            targetId: audiovisualId,
            targetType: 'audiovisual',
            detalhes: {
                tipo,
                aprovado,
                motivoRejeicao: motivoRejeicao || null,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await db.collection('adminLogs').add(logData);
        logger_1.logger.business('Profissional audiovisual validado', { audiovisualId, aprovado, tipo }, contextData);
        return { success: true, audiovisualId, aprovado };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger_1.logger.error('Erro ao validar profissional audiovisual', { error: errorMessage, audiovisualId: data.audiovisualId }, contextData);
        throw error;
    }
});
// Função para validar dados do audiovisual
function validateAudiovisualData(data) {
    const errors = [];
    // Validar nome
    if (!data.nome || typeof data.nome !== 'string' || data.nome.length < 2) {
        errors.push('nome inválido');
    }
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('email inválido');
    }
    // Validar telefone
    if (!data.telefone || typeof data.telefone !== 'string' || data.telefone.length < 10) {
        errors.push('telefone inválido');
    }
    // Validar área
    const validAreas = ['fotografia', 'video', 'drone', 'podcast', 'midia'];
    if (!data.area || !validAreas.includes(data.area)) {
        errors.push('área inválida');
    }
    // Validar experiência
    if (!data.experiencia || typeof data.experiencia !== 'string' || data.experiencia.length < 10) {
        errors.push('experiência muito curta');
    }
    return { isValid: errors.length === 0, errors };
}
// Função para verificar se já existe inscrição
async function checkExistingAudiovisual(email) {
    try {
        const existing = await db.collection('audiovisual')
            .where('email', '==', email.toLowerCase())
            .where('status', 'in', ['pending', 'paid', 'confirmed'])
            .limit(1)
            .get();
        return !existing.empty;
    }
    catch (error) {
        console.error('Erro ao verificar inscrição existente:', error);
        return false;
    }
}
exports.criarInscricaoAudiovisual = functions.https.onCall(async (data, context) => {
    var _a;
    try {
        // Verificar autenticação
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
        }
        // Validar dados
        const validation = validateAudiovisualData(data);
        if (!validation.isValid) {
            throw new functions.https.HttpsError('invalid-argument', `Dados inválidos: ${validation.errors.join(', ')}`);
        }
        // Verificar se já existe inscrição
        const hasExisting = await checkExistingAudiovisual(data.email);
        if (hasExisting) {
            throw new functions.https.HttpsError('already-exists', 'Email já possui inscrição');
        }
        const valor = 29.90;
        // Criar inscrição no Firestore com transação
        const result = await db.runTransaction(async (transaction) => {
            var _a, _b;
            const inscricaoRef = db.collection('audiovisual').doc();
            const inscricaoData = {
                nome: data.nome.trim(),
                email: data.email.toLowerCase().trim(),
                telefone: data.telefone.trim(),
                area: data.area,
                experiencia: data.experiencia.trim(),
                portfolio: ((_a = data.portfolio) === null || _a === void 0 ? void 0 : _a.trim()) || '',
                valor,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: context.auth.uid,
                ipAddress: ((_b = context.rawRequest) === null || _b === void 0 ? void 0 : _b.ip) || 'unknown'
            };
            transaction.set(inscricaoRef, inscricaoData);
            return { inscricaoRef, inscricaoData };
        });
        // Integração com FlowPay
        const flowpayData = {
            externalId: result.inscricaoRef.id,
            amount: Math.round(valor * 100), // FlowPay usa centavos
            customer: {
                name: data.nome,
                email: data.email,
            },
            items: [
                {
                    name: 'Inscrição Audiovisual - CERRADØ INTERBOX 2025',
                    quantity: 1,
                    unitAmount: Math.round(valor * 100),
                }
            ],
            paymentMethod: 'PIX',
            expiresIn: 3600, // 1 hora
            metadata: {
                tipo: 'audiovisual',
                area: data.area,
                inscricaoId: result.inscricaoRef.id
            }
        };
        // Chamar API do FlowPay com timeout
        const flowpayResponse = await axios_1.default.post('https://api.flowpay.com.br/v1/orders', flowpayData, {
            headers: {
                'Authorization': `Bearer ${functions.config().flowpay.api_key}`,
                'Content-Type': 'application/json',
            },
            timeout: 10000 // 10 segundos timeout
        });
        const { id: flowpayOrderId, pixQrCode, pixQrCodeText } = flowpayResponse.data;
        // Atualizar inscrição com dados do FlowPay
        await result.inscricaoRef.update({
            flowpayOrderId,
            pixCode: pixQrCodeText,
            pixExpiration: new Date(Date.now() + 3600 * 1000),
            updatedAt: new Date(),
        });
        // Log administrativo
        await db.collection('adminLogs').add({
            adminId: context.auth.uid,
            adminEmail: context.auth.token.email || '',
            acao: 'criacao_inscricao_audiovisual',
            targetId: result.inscricaoRef.id,
            targetType: 'audiovisual',
            detalhes: {
                nome: data.nome,
                area: data.area,
                valor,
                ipAddress: ((_a = context.rawRequest) === null || _a === void 0 ? void 0 : _a.ip) || 'unknown'
            },
            createdAt: new Date(),
        });
        return {
            success: true,
            inscricaoId: result.inscricaoRef.id,
            flowpayOrderId,
            pixQrCode,
            pixQrCodeText,
            valor,
            expiresIn: 3600,
        };
    }
    catch (error) {
        console.error('Erro ao criar inscrição audiovisual:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        // Log de erro para debugging
        if (error instanceof Error) {
            console.error('Erro detalhado:', {
                message: error.message,
                stack: error.stack,
                email: data === null || data === void 0 ? void 0 : data.email,
                area: data === null || data === void 0 ? void 0 : data.area
            });
        }
        throw new functions.https.HttpsError('internal', 'Erro interno do servidor');
    }
});
//# sourceMappingURL=audiovisual.js.map