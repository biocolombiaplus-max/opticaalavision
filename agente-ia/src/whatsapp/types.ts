export interface WhatsAppWebhookBody {
  object?: string;
  entry?: Array<{
    id: string;
    changes: Array<{
      field: string;
      value: {
        messaging_product: string;
        metadata?: { display_phone_number: string; phone_number_id: string };
        contacts?: Array<{ profile: { name: string }; wa_id: string }>;
        messages?: Array<IncomingMessage>;
      };
    }>;
  }>;
}

export interface IncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: "text" | "image" | "interactive" | "button" | string;
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  interactive?: {
    type: "button_reply" | "list_reply";
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string };
  };
}
