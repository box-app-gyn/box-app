"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processFlowPayWebhook = processFlowPayWebhook;
const firestore_1 = require("firebase-admin/firestore");
// Função de email local para evitar dependência externa
async function enviaEmailPagamento(data) {
    // Implementação básica - pode ser expandida conforme necessário
    console.log('📧 Email de confirmação:', {
        to: data.userEmail,
        user: data.userName,
        tipo: data.tipo,
        dados: data.dadosAdicionais
    });
    // TODO: Implementar envio real de email se necessário
    // Por enquanto apenas log para manter independência
}
async function processFlowPayWebhook(req, res, db) {
    var _a, _b, _c, _d, _e, _f;
    console.log('Payload recebido:', JSON.stringify(req.body, null, 2));
    const ref = ((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.charge) === null || _b === void 0 ? void 0 : _b.reference) ||
        ((_c = req.body) === null || _c === void 0 ? void 0 : _c.reference) ||
        ((_d = req.body) === null || _d === void 0 ? void 0 : _d.custom_id) ||
        null;
    if (!ref) {
        res.status(400).send('Referência não encontrada no payload');
        return;
    }
    // Verificar se é um time ou audiovisual
    const teamDoc = await db.collection('teams').doc(ref).get();
    const audiovisualDoc = await db.collection('audiovisual').doc(ref).get();
    if (teamDoc.exists) {
        const teamData = teamDoc.data();
        // Atualizar status do pagamento
        await db.collection('teams').doc(ref).update({
            statusPagamento: 'paid',
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            paidAt: firestore_1.FieldValue.serverTimestamp()
        });
        console.log(`Pagamento confirmado para time: ${ref}`);
        // Enviar email de confirmação
        if ((teamData === null || teamData === void 0 ? void 0 : teamData.email) && (teamData === null || teamData === void 0 ? void 0 : teamData.nome)) {
            try {
                await enviaEmailPagamento({
                    userEmail: teamData.email,
                    userName: teamData.nome,
                    tipo: 'pagamento',
                    dadosAdicionais: {
                        tipo: 'Inscrição de Time',
                        valor: ((_e = teamData.valor) === null || _e === void 0 ? void 0 : _e.toFixed(2)) || '0,00',
                        metodo: 'PIX',
                        data: new Date().toLocaleDateString('pt-BR'),
                        categoria: teamData.categoria,
                        time: teamData.nome
                    }
                });
                console.log(`Email de confirmação enviado para: ${teamData.email}`);
            }
            catch (error) {
                console.error('Erro ao enviar email de confirmação:', error);
            }
        }
    }
    else if (audiovisualDoc.exists) {
        const audiovisualData = audiovisualDoc.data();
        // Atualizar status do pagamento
        await db.collection('audiovisual').doc(ref).update({
            statusPagamento: 'paid',
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            paidAt: firestore_1.FieldValue.serverTimestamp()
        });
        console.log(`Pagamento confirmado para audiovisual: ${ref}`);
        // Enviar email de confirmação
        if ((audiovisualData === null || audiovisualData === void 0 ? void 0 : audiovisualData.email) && (audiovisualData === null || audiovisualData === void 0 ? void 0 : audiovisualData.nome)) {
            try {
                await enviaEmailPagamento({
                    userEmail: audiovisualData.email,
                    userName: audiovisualData.nome,
                    tipo: 'pagamento',
                    dadosAdicionais: {
                        tipo: 'Inscrição Audiovisual',
                        valor: ((_f = audiovisualData.valor) === null || _f === void 0 ? void 0 : _f.toFixed(2)) || '29,90',
                        metodo: 'PIX',
                        data: new Date().toLocaleDateString('pt-BR'),
                        area: audiovisualData.area
                    }
                });
                console.log(`Email de confirmação enviado para: ${audiovisualData.email}`);
            }
            catch (error) {
                console.error('Erro ao enviar email de confirmação:', error);
            }
        }
    }
    else {
        console.error(`Documento não encontrado para referência: ${ref}`);
        res.status(404).send('Documento não encontrado');
        return;
    }
    res.status(200).send('OK');
}
//# sourceMappingURL=webhook.js.map