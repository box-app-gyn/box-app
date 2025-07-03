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
exports.criarInscricaoTime = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const db = admin.firestore();
// Constantes de valores e lotes
const VALORES_INSCRICAO = {
    lote1: {
        rx: 494.95,
        master145: 394.95,
        amador: 394.95,
        scale: 394.95,
        iniciante: 394.95
    },
    lote2: {
        rx: 544.95,
        master145: 444.95,
        amador: 444.95,
        scale: 444.95,
        iniciante: 444.95
    },
    lote3: {
        rx: 594.95,
        master145: 494.95,
        amador: 494.95,
        scale: 494.95,
        iniciante: 494.95
    }
};
const VAGAS_CATEGORIAS = {
    rx: 20,
    master145: 20,
    amador: 40,
    scale: 80,
    iniciante: 40
};
const LIMITES_LOTES = {
    lote1: 120,
    lote2: 180,
    lote3: 220
};
// Função para determinar o lote atual
function getLoteAtual() {
    const hoje = new Date();
    const inicioLote1 = new Date('2025-07-13');
    const fimLote1 = new Date('2025-07-24');
    const inicioLote2 = new Date('2025-07-25');
    const fimLote2 = new Date('2025-08-16');
    const inicioLote3 = new Date('2025-08-08');
    const fimLote3 = new Date('2025-09-08');
    if (hoje >= inicioLote1 && hoje <= fimLote1)
        return 1;
    if (hoje >= inicioLote2 && hoje <= fimLote2)
        return 2;
    if (hoje >= inicioLote3 && hoje <= fimLote3)
        return 3;
    // Se não está em nenhum período, retorna lote 1 (pré-inscrição)
    return 1;
}
// Função para verificar vagas disponíveis
async function verificarVagasDisponiveis(categoria) {
    try {
        const inscricoesConfirmadas = await db.collection('inscricoes_times')
            .where('categoria', '==', categoria)
            .where('status', '==', 'confirmed')
            .get();
        const vagasOcupadas = inscricoesConfirmadas.size;
        const vagasTotal = VAGAS_CATEGORIAS[categoria];
        const vagasRestantes = vagasTotal - vagasOcupadas;
        return {
            disponivel: vagasRestantes > 0,
            vagasRestantes
        };
    }
    catch (error) {
        console.error('Erro ao verificar vagas:', error);
        return { disponivel: false, vagasRestantes: 0 };
    }
}
// Função para verificar limite do lote
async function verificarLimiteLote(lote) {
    try {
        const inscricoesConfirmadas = await db.collection('inscricoes_times')
            .where('lote', '==', lote)
            .where('status', '==', 'confirmed')
            .get();
        const limite = LIMITES_LOTES[`lote${lote}`];
        const inscricoesRestantes = limite - inscricoesConfirmadas.size;
        return {
            disponivel: inscricoesRestantes > 0,
            inscricoesRestantes
        };
    }
    catch (error) {
        console.error('Erro ao verificar limite do lote:', error);
        return { disponivel: false, inscricoesRestantes: 0 };
    }
}
// Função para validar dados da inscrição
function validateInscricaoData(data) {
    const errors = [];
    // Validar timeId
    if (!data.timeId || typeof data.timeId !== 'string' || data.timeId.length < 3) {
        errors.push('timeId inválido');
    }
    // Validar timeName
    if (!data.timeName || typeof data.timeName !== 'string' || data.timeName.length < 2) {
        errors.push('timeName inválido');
    }
    // Validar categoria
    const validCategories = ['rx', 'master145', 'amador', 'scale', 'iniciante'];
    if (!data.categoria || !validCategories.includes(data.categoria)) {
        errors.push('categoria inválida');
    }
    // Validar atletas (deve ter exatamente 4)
    if (!Array.isArray(data.atletas) || data.atletas.length !== 4) {
        errors.push('deve ter exatamente 4 atletas');
    }
    else {
        // Validar cada atleta
        data.atletas.forEach((atleta, index) => {
            if (!atleta.nome || !atleta.email || !atleta.telefone || !atleta.genero) {
                errors.push(`atleta ${index + 1} com dados incompletos`);
            }
            if (!['masculino', 'feminino'].includes(atleta.genero)) {
                errors.push(`atleta ${index + 1} com gênero inválido`);
            }
        });
        // Verificar se tem 2 homens e 2 mulheres
        const homens = data.atletas.filter(a => a.genero === 'masculino').length;
        const mulheres = data.atletas.filter(a => a.genero === 'feminino').length;
        if (homens !== 2 || mulheres !== 2) {
            errors.push('deve ter exatamente 2 homens e 2 mulheres');
        }
    }
    // Validar box
    if (!data.box || typeof data.box !== 'string' || data.box.length < 2) {
        errors.push('box inválida');
    }
    return { isValid: errors.length === 0, errors };
}
// Função para verificar se time já tem inscrição pendente
async function checkPendingInscricao(timeId) {
    try {
        const pendingInscricoes = await db.collection('inscricoes_times')
            .where('timeId', '==', timeId)
            .where('status', 'in', ['pending', 'paid'])
            .limit(1)
            .get();
        return !pendingInscricoes.empty;
    }
    catch (error) {
        console.error('Erro ao verificar inscrições pendentes:', error);
        return false;
    }
}
exports.criarInscricaoTime = functions.https.onCall(async (data, context) => {
    var _a;
    try {
        // Verificar autenticação
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
        }
        // Verificar se o usuário é o capitão
        if (data.captainId !== context.auth.uid) {
            throw new functions.https.HttpsError('permission-denied', 'Apenas o capitão pode criar inscrição');
        }
        // Validar dados
        const validation = validateInscricaoData(data);
        if (!validation.isValid) {
            throw new functions.https.HttpsError('invalid-argument', `Dados inválidos: ${validation.errors.join(', ')}`);
        }
        // Verificar se time já tem inscrição pendente
        const hasPendingInscricao = await checkPendingInscricao(data.timeId);
        if (hasPendingInscricao) {
            throw new functions.https.HttpsError('already-exists', 'Time já possui inscrição pendente');
        }
        // Determinar lote atual
        const loteAtual = getLoteAtual();
        // Verificar vagas disponíveis na categoria
        const vagasDisponiveis = await verificarVagasDisponiveis(data.categoria);
        if (!vagasDisponiveis.disponivel) {
            throw new functions.https.HttpsError('resource-exhausted', `Vagas esgotadas para categoria ${data.categoria}`);
        }
        // Verificar limite do lote
        const limiteLote = await verificarLimiteLote(loteAtual);
        if (!limiteLote.disponivel) {
            throw new functions.https.HttpsError('resource-exhausted', `Lote ${loteAtual} esgotado`);
        }
        // Calcular valor
        const valor = VALORES_INSCRICAO[`lote${loteAtual}`][data.categoria];
        // Criar inscrição no Firestore com transação
        const result = await db.runTransaction(async (transaction) => {
            var _a;
            const inscricaoRef = db.collection('inscricoes_times').doc();
            const inscricaoData = {
                timeId: data.timeId,
                timeName: data.timeName,
                categoria: data.categoria,
                lote: loteAtual,
                valor,
                status: 'pending',
                atletas: data.atletas,
                box: data.box,
                captainId: data.captainId,
                captainEmail: data.captainEmail,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: context.auth.uid,
                ipAddress: ((_a = context.rawRequest) === null || _a === void 0 ? void 0 : _a.ip) || 'unknown'
            };
            transaction.set(inscricaoRef, inscricaoData);
            return { inscricaoRef, inscricaoData };
        });
        // Integração com FlowPay
        const flowpayData = {
            externalId: result.inscricaoRef.id,
            amount: Math.round(valor * 100), // FlowPay usa centavos
            customer: {
                name: data.timeName,
                email: data.captainEmail,
            },
            items: [
                {
                    name: `Inscrição ${data.categoria.toUpperCase()} - CERRADØ INTERBOX 2025`,
                    quantity: 1,
                    unitAmount: Math.round(valor * 100),
                }
            ],
            paymentMethod: 'PIX',
            expiresIn: 3600, // 1 hora
            metadata: {
                tipo: 'inscricao_time',
                categoria: data.categoria,
                lote: loteAtual,
                timeId: data.timeId
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
            acao: 'criacao_inscricao_time',
            targetId: result.inscricaoRef.id,
            targetType: 'inscricao_time',
            detalhes: {
                timeName: data.timeName,
                categoria: data.categoria,
                lote: loteAtual,
                valor,
                vagasRestantes: vagasDisponiveis.vagasRestantes,
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
            lote: loteAtual,
            vagasRestantes: vagasDisponiveis.vagasRestantes,
            expiresIn: 3600,
        };
    }
    catch (error) {
        console.error('Erro ao criar inscrição de time:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        // Log de erro para debugging
        if (error instanceof Error) {
            console.error('Erro detalhado:', {
                message: error.message,
                stack: error.stack,
                timeId: data === null || data === void 0 ? void 0 : data.timeId,
                categoria: data === null || data === void 0 ? void 0 : data.categoria
            });
        }
        throw new functions.https.HttpsError('internal', 'Erro interno do servidor');
    }
});
//# sourceMappingURL=pedidos.js.map