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
exports.cancelarConviteTime = exports.listarConvitesUsuario = exports.responderConviteTime = exports.enviarConviteTime = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const logger_1 = require("./utils/logger");
const db = firebase_admin_1.default.firestore();
// Função para enviar convite para time
exports.enviarConviteTime = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e;
    const contextData = { userId: (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid };
    try {
        // Validar dados
        if (!data.teamId || !data.teamName || !data.captainId || !data.captainName || !data.invitedEmail) {
            throw new functions.https.HttpsError('invalid-argument', 'Dados obrigatórios ausentes');
        }
        // Verificar se o usuário é o capitão do time
        if (((_b = context.auth) === null || _b === void 0 ? void 0 : _b.uid) !== data.captainId) {
            throw new functions.https.HttpsError('permission-denied', 'Apenas o capitão pode enviar convites');
        }
        // Verificar se o time existe
        const teamRef = db.collection('teams').doc(data.teamId);
        const teamDoc = await teamRef.get();
        if (!teamDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Time não encontrado');
        }
        const teamData = teamDoc.data();
        if (!teamData) {
            throw new functions.https.HttpsError('internal', 'Dados do time inválidos');
        }
        // Verificar se o time não está completo
        if (teamData.atletas && teamData.atletas.length >= 4) {
            throw new functions.https.HttpsError('failed-precondition', 'Time já está completo');
        }
        // Verificar se já existe convite pendente para este email
        const conviteExistente = await db.collection('convites_times')
            .where('teamId', '==', data.teamId)
            .where('invitedEmail', '==', data.invitedEmail)
            .where('status', '==', 'pendente')
            .limit(1)
            .get();
        if (!conviteExistente.empty) {
            throw new functions.https.HttpsError('already-exists', 'Convite já enviado para este email');
        }
        // Criar convite
        const conviteRef = await db.collection('convites_times').add({
            teamId: data.teamId,
            teamName: data.teamName,
            captainId: data.captainId,
            captainName: data.captainName,
            captainEmail: ((_c = context.auth) === null || _c === void 0 ? void 0 : _c.token.email) || '',
            invitedEmail: data.invitedEmail,
            invitedName: data.invitedName || '',
            status: 'pendente',
            createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
            createdBy: (_d = context.auth) === null || _d === void 0 ? void 0 : _d.uid,
            ipAddress: ((_e = context.rawRequest) === null || _e === void 0 ? void 0 : _e.ip) || 'unknown'
        });
        // Enviar email de convite
        await enviarEmailConvite({
            conviteId: conviteRef.id,
            teamName: data.teamName,
            captainName: data.captainName,
            invitedEmail: data.invitedEmail,
            invitedName: data.invitedName || 'Atleta'
        });
        logger_1.logger.business('Convite de time enviado', {
            conviteId: conviteRef.id,
            teamId: data.teamId,
            invitedEmail: data.invitedEmail
        }, contextData);
        return {
            success: true,
            conviteId: conviteRef.id,
            message: 'Convite enviado com sucesso'
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger_1.logger.error('Erro ao enviar convite de time', { error: errorMessage }, contextData);
        throw error;
    }
});
// Função para responder a convite
exports.responderConviteTime = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d;
    const contextData = { userId: (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid };
    try {
        // Validar dados
        if (!data.conviteId || !data.resposta || !data.userId || !data.userName) {
            throw new functions.https.HttpsError('invalid-argument', 'Dados obrigatórios ausentes');
        }
        // Verificar se o usuário é o convidado
        if (((_b = context.auth) === null || _b === void 0 ? void 0 : _b.uid) !== data.userId) {
            throw new functions.https.HttpsError('permission-denied', 'Apenas o convidado pode responder ao convite');
        }
        // Buscar convite
        const conviteRef = db.collection('convites_times').doc(data.conviteId);
        const conviteDoc = await conviteRef.get();
        if (!conviteDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Convite não encontrado');
        }
        const conviteData = conviteDoc.data();
        if (!conviteData) {
            throw new functions.https.HttpsError('internal', 'Dados do convite inválidos');
        }
        // Verificar se o convite ainda é válido
        if (conviteData.status !== 'pendente') {
            throw new functions.https.HttpsError('failed-precondition', 'Convite já foi respondido');
        }
        if (conviteData.expiresAt && (((_c = conviteData.expiresAt) === null || _c === void 0 ? void 0 : _c.toDate) ? conviteData.expiresAt.toDate() : new Date(conviteData.expiresAt)) < new Date()) {
            throw new functions.https.HttpsError('failed-precondition', 'Convite expirado');
        }
        // Atualizar status do convite
        await conviteRef.update({
            status: data.resposta,
            respondedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            respondedBy: (_d = context.auth) === null || _d === void 0 ? void 0 : _d.uid
        });
        if (data.resposta === 'aceito') {
            // Adicionar usuário ao time
            const teamRef = db.collection('teams').doc(conviteData.teamId);
            await teamRef.update({
                atletas: firebase_admin_1.default.firestore.FieldValue.arrayUnion(data.userId),
                updatedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp()
            });
            // Enviar email de confirmação para o capitão
            await enviarEmailConfirmacaoConvite({
                teamName: conviteData.teamName,
                captainEmail: conviteData.captainEmail,
                captainName: conviteData.captainName,
                invitedName: data.userName,
                resposta: 'aceito'
            });
        }
        else {
            // Enviar email de recusa para o capitão
            await enviarEmailConfirmacaoConvite({
                teamName: conviteData.teamName,
                captainEmail: conviteData.captainEmail,
                captainName: conviteData.captainName,
                invitedName: data.userName,
                resposta: 'recusado'
            });
        }
        logger_1.logger.business('Convite de time respondido', {
            conviteId: data.conviteId,
            resposta: data.resposta,
            teamId: conviteData.teamId
        }, contextData);
        return {
            success: true,
            message: `Convite ${data.resposta === 'aceito' ? 'aceito' : 'recusado'} com sucesso`
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger_1.logger.error('Erro ao responder convite de time', { error: errorMessage }, contextData);
        throw error;
    }
});
// Função para listar convites do usuário
exports.listarConvitesUsuario = functions.https.onCall(async (data, context) => {
    var _a, _b, _c;
    const contextData = { userId: (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid };
    try {
        if (!data.userId) {
            throw new functions.https.HttpsError('invalid-argument', 'UserId obrigatório');
        }
        // Verificar se o usuário está consultando seus próprios convites
        if (((_b = context.auth) === null || _b === void 0 ? void 0 : _b.uid) !== data.userId) {
            throw new functions.https.HttpsError('permission-denied', 'Apenas o próprio usuário pode consultar seus convites');
        }
        // Buscar convites pendentes para o usuário
        const convitesSnapshot = await db.collection('convites_times')
            .where('invitedEmail', '==', (_c = context.auth) === null || _c === void 0 ? void 0 : _c.token.email)
            .where('status', '==', 'pendente')
            .orderBy('createdAt', 'desc')
            .get();
        const convites = convitesSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        logger_1.logger.business('Convites do usuário consultados', {
            userId: data.userId,
            quantidade: convites.length
        }, contextData);
        return {
            success: true,
            convites
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger_1.logger.error('Erro ao listar convites do usuário', { error: errorMessage }, contextData);
        throw error;
    }
});
// Função para cancelar convite (apenas capitão)
exports.cancelarConviteTime = functions.https.onCall(async (data, context) => {
    var _a, _b, _c;
    const contextData = { userId: (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid };
    try {
        if (!data.conviteId) {
            throw new functions.https.HttpsError('invalid-argument', 'ConviteId obrigatório');
        }
        // Buscar convite
        const conviteRef = db.collection('convites_times').doc(data.conviteId);
        const conviteDoc = await conviteRef.get();
        if (!conviteDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Convite não encontrado');
        }
        const conviteData = conviteDoc.data();
        if (!conviteData) {
            throw new functions.https.HttpsError('internal', 'Dados do convite inválidos');
        }
        // Verificar se o usuário é o capitão
        if (((_b = context.auth) === null || _b === void 0 ? void 0 : _b.uid) !== conviteData.captainId) {
            throw new functions.https.HttpsError('permission-denied', 'Apenas o capitão pode cancelar o convite');
        }
        // Verificar se o convite ainda está pendente
        if (conviteData.status !== 'pendente') {
            throw new functions.https.HttpsError('failed-precondition', 'Convite já foi respondido');
        }
        // Cancelar convite
        await conviteRef.update({
            status: 'cancelado',
            canceledAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            canceledBy: (_c = context.auth) === null || _c === void 0 ? void 0 : _c.uid
        });
        logger_1.logger.business('Convite de time cancelado', {
            conviteId: data.conviteId,
            teamId: conviteData.teamId
        }, contextData);
        return {
            success: true,
            message: 'Convite cancelado com sucesso'
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger_1.logger.error('Erro ao cancelar convite de time', { error: errorMessage }, contextData);
        throw error;
    }
});
// Função para enviar email de convite
async function enviarEmailConvite(data) {
    const contextData = { userId: undefined };
    try {
        const subject = `Convite para Time - ${data.teamName} | Interbox 2025`;
        // (HTML do email gerado, mas não usado enquanto não houver envio real)
        logger_1.logger.business('Email de convite de time gerado', {
            conviteId: data.conviteId,
            invitedEmail: data.invitedEmail,
            subject
        }, contextData);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger_1.logger.error('Erro ao enviar email de convite', { error: errorMessage }, contextData);
    }
}
// Função para enviar email de confirmação de convite
async function enviarEmailConfirmacaoConvite(data) {
    const contextData = { userId: undefined };
    try {
        const subject = `Resposta ao Convite - ${data.teamName} | Interbox 2025`;
        // (HTML do email gerado, mas não usado enquanto não houver envio real)
        logger_1.logger.business('Email de confirmação de convite gerado', {
            captainEmail: data.captainEmail,
            resposta: data.resposta,
            subject
        }, contextData);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger_1.logger.error('Erro ao enviar email de confirmação de convite', { error: errorMessage }, contextData);
    }
}
//# sourceMappingURL=teams.js.map