export type CustomerContext = {
  phone: string;
  name: string | null;
  email: string | null;
  loyaltyPoints: number;
  preferences: string | null;
  lastVisit: string | null;
  tags: string | null;
};

export type LlamaAction =
  | {
      type: 'create_reservation_request';
      data: {
        date?: string;
        time?: string;
        people?: number;
        notes?: string;
      };
    }
  | {
      type: 'add_loyalty_points';
      data: {
        points?: number;
        reason?: string;
      };
    }
  | {
      type: 'send_email_confirmation';
      data: {
        subject?: string;
        html?: string;
      };
    }
  | {
      type: 'notify_team';
      data: {
        message?: string;
      };
    };

export type LlamaResult = {
  response: string;
  actions: LlamaAction[];
  rawModelResponse?: string;
};

export type BaileysWebhookPayload = {
  messageId: string;
  phone: string;
  message: string;
  pushName?: string;
  timestamp?: string;
};
