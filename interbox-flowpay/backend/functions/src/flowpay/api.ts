export interface FlowPayConfig {
  apiKey: string;
  baseUrl: string;
}

export interface CreateChargeRequest {
  correlationID: string;
  value: number;
  comment?: string;
  expiresIn?: number;
}

export interface ChargeResponse {
  correlationID: string;
  value: number;
  status: string;
  pixKey?: string;
  qrCode?: string;
  expiresAt?: string;
}

export class FlowPayAPI {
  private config: FlowPayConfig;

  constructor(config: FlowPayConfig) {
    this.config = config;
  }

  async createCharge(data: CreateChargeRequest): Promise<ChargeResponse> {
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

    return response.json() as Promise<ChargeResponse>;
  }

  async getChargeStatus(correlationID: string): Promise<ChargeResponse> {
    const response = await fetch(`${this.config.baseUrl}/charge/${correlationID}`, {
      headers: {
        'Authorization': this.config.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    return response.json() as Promise<ChargeResponse>;
  }

  async registerWebhook(url: string, events: string[] = ['CHARGE_COMPLETED']): Promise<void> {
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