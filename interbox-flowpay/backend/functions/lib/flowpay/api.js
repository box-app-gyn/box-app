"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowPayAPI = void 0;
class FlowPayAPI {
    constructor(config) {
        this.config = config;
    }
    async createCharge(data) {
        const response = await fetch(`${this.config.baseUrl}/charge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.config.apiKey
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        return response.json();
    }
    async getChargeStatus(correlationID) {
        const response = await fetch(`${this.config.baseUrl}/charge/${correlationID}`, {
            headers: {
                'Authorization': this.config.apiKey
            }
        });
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        return response.json();
    }
    async registerWebhook(url, events = ['CHARGE_COMPLETED']) {
        const response = await fetch(`${this.config.baseUrl}/webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.config.apiKey
            },
            body: JSON.stringify({
                url,
                events,
                isActive: true
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao registrar webhook: ${response.status} - ${errorText}`);
        }
    }
}
exports.FlowPayAPI = FlowPayAPI;
//# sourceMappingURL=api.js.map