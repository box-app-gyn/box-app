"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processFlowPayWebhook = processFlowPayWebhook;
const firestore_1 = require("firebase-admin/firestore");
async function processFlowPayWebhook(req, res, db) {
    var _a, _b, _c, _d;
    console.log('Payload recebido:', JSON.stringify(req.body, null, 2));
    const ref = ((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.charge) === null || _b === void 0 ? void 0 : _b.reference) ||
        ((_c = req.body) === null || _c === void 0 ? void 0 : _c.reference) ||
        ((_d = req.body) === null || _d === void 0 ? void 0 : _d.custom_id) ||
        null;
    if (!ref) {
        res.status(400).send('Referência não encontrada no payload');
        return;
    }
    await db.collection('teams').doc(ref).update({
        statusPagamento: 'paid',
        updatedAt: firestore_1.FieldValue.serverTimestamp()
    });
    res.status(200).send('OK');
}
//# sourceMappingURL=webhook.js.map