import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  buildCampaignPlan,
  buildMessageVariants,
  formatWhatsAppMarketingMessage,
  sendNumberedMenu,
  sendSingleMarketingMedia,
  sendSingleMarketingMessage,
  type BridgeClient,
  type MarketingConfig
} from "./policy.js";

export function createWhatsAppMarketingMcpServer(bridge: BridgeClient, config: MarketingConfig): McpServer {
  const server = new McpServer({
    name: "cuiabar-whatsapp-marketing",
    version: "0.1.0"
  });

  server.registerTool(
    "create_message_variants",
    {
      title: "Criar variantes de mensagem",
      description: "Cria variantes de texto para campanha. Em treino, o robo pode revisar consentimento fora do MCP.",
      inputSchema: {
        campaignName: z.string().min(1).max(120),
        baseMessage: z.string().min(1).max(900),
        audience: z.string().min(1).max(160),
        offer: z.string().max(240).optional(),
        tone: z.enum(["direto", "cordial", "premium", "urgente_suave"]).default("cordial"),
        variantCount: z.number().int().min(1).max(8).default(4),
        optOutText: z.string().min(6).max(160).default("Responda SAIR para nao receber novas mensagens.")
      }
    },
    async (input) => textResult(buildMessageVariants(input))
  );

  server.registerTool(
    "plan_consented_campaign",
    {
      title: "Planejar campanha consentida",
      description:
        "Monta um plano de disparo com janela, limites e cadencia. Em validateOnly/trainingMode nao exige consentimento no payload.",
      inputSchema: campaignPlanSchema()
    },
    async (input) => textResult(buildCampaignPlan(input, config))
  );

  server.registerTool(
    "format_whatsapp_marketing_message",
    {
      title: "Formatar mensagem WhatsApp",
      description: "Gera texto WhatsApp com titulo em negrito, corpo em italico e precos/informacoes uteis em citacao.",
      inputSchema: formatMessageSchema()
    },
    async (input) => textResult(formatWhatsAppMarketingMessage(input))
  );

  server.registerTool(
    "send_form",
    {
      title: "Enviar form",
      description:
        "Envia um form de texto com opcoes 1, 2, 3... O cliente responde somente com o numero, o bridge responde uma vez e encerra a sessao.",
      inputSchema: {
        recipient: recipientSchema(),
        title: z.string().min(1).max(200).optional(),
        body: z.string().min(1).max(3000),
        options: numberedMenuOptionsSchema(),
        footer: z.string().min(1).max(1000).optional(),
        invalidResponseText: z.string().min(1).max(1000).optional(),
        expiresInMinutes: z.number().int().min(1).max(1440).default(60),
        validateOnly: z.boolean().default(true),
        trainingMode: z.boolean().default(false),
        confirmWrite: z.literal("ENVIAR_MENU_NUMERADO").optional()
      }
    },
    async (input) => textResult(await sendNumberedMenu(bridge, input))
  );

  server.registerTool(
    "send_numbered_menu",
    {
      title: "Enviar menu numerado",
      description: "Alias de send_form mantido por compatibilidade.",
      inputSchema: {
        recipient: recipientSchema(),
        title: z.string().min(1).max(200).optional(),
        body: z.string().min(1).max(3000),
        options: numberedMenuOptionsSchema(),
        footer: z.string().min(1).max(1000).optional(),
        invalidResponseText: z.string().min(1).max(1000).optional(),
        expiresInMinutes: z.number().int().min(1).max(1440).default(60),
        validateOnly: z.boolean().default(true),
        trainingMode: z.boolean().default(false),
        confirmWrite: z.literal("ENVIAR_MENU_NUMERADO").optional()
      }
    },
    async (input) => textResult(await sendNumberedMenu(bridge, input))
  );

  server.registerTool(
    "send_single_marketing_message",
    {
      title: "Enviar mensagem consentida individual",
      description: "Simula ou envia mensagem individual. Em validateOnly/trainingMode nao exige consentimento, opt-out ou remetente no texto.",
      inputSchema: {
        recipient: recipientSchema(),
        text: z.string().min(1).max(1200),
        validateOnly: z.boolean().default(true),
        trainingMode: z.boolean().default(false),
        confirmWrite: z.literal("ENVIAR_WHATSAPP_CONSENTIDO").optional()
      }
    },
    async (input) => textResult(await sendSingleMarketingMessage(bridge, input))
  );

  server.registerTool(
    "send_single_marketing_media",
    {
      title: "Enviar midia consentida individual",
      description:
        "Simula ou envia foto, video, audio, mensagem de voz ou arquivo. Em validateOnly/trainingMode nao exige consentimento, opt-out ou remetente no texto.",
      inputSchema: {
        recipient: recipientSchema(),
        mediaType: z.enum(["image", "video", "audio", "document"]),
        filePath: z.string().min(1).optional(),
        mediaUrl: z.string().url().optional(),
        ...formatMessageSchema(),
        caption: z.string().min(1).max(1200).optional(),
        fileName: z.string().min(1).max(200).optional(),
        mimeType: z.string().min(3).max(120).optional(),
        asVoice: z.boolean().default(false),
        validateOnly: z.boolean().default(true),
        trainingMode: z.boolean().default(false),
        confirmWrite: z.literal("ENVIAR_WHATSAPP_MIDIA_CONSENTIDA").optional()
      }
    },
    async (input) => textResult(await sendSingleMarketingMedia(bridge, input))
  );

  server.registerResource(
    "policy",
    "whatsapp-marketing-mcp://policy",
    {
      title: "Politica de marketing WhatsApp",
      description: "Limites e regras de conformidade deste MCP.",
      mimeType: "application/json"
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              service: "whatsapp-marketing-mcp",
              maxBatchSize: config.maxBatchSize,
              minDelaySeconds: config.minDelaySeconds,
              maxDailyRecipients: config.maxDailyRecipients,
              requiredOptOut: true,
              requiredConsent: true,
              relaxedValidationWhenValidateOnly: true,
              trainingModeSupported: true,
              noBlockEvasion: true
            },
            null,
            2
          )
        }
      ]
    })
  );

  return server;
}

function numberedMenuOptionsSchema() {
  return z
    .array(
      z.object({
        label: z.string().min(1).max(80),
        responseText: z.string().min(1).max(4000)
      })
    )
    .min(1)
    .max(10);
}

function formatMessageSchema() {
  return {
    title: z.string().min(1).max(200).optional(),
    body: z.string().min(1).max(3000).optional(),
    quotes: z.array(z.string().min(1).max(500)).max(20).default([]),
    footer: z.string().min(1).max(1000).optional()
  };
}

function campaignPlanSchema() {
  return {
    campaignName: z.string().min(1).max(120),
    recipients: z.array(recipientSchema()).min(1).max(500),
    variants: z.array(z.string().min(1).max(1200)).min(1).max(20),
    startAt: z.string().datetime().optional(),
    quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/).default("21:00"),
    quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).default("09:00"),
    minDelaySeconds: z.number().int().min(30).max(3600).optional(),
    maxDailyRecipients: z.number().int().min(1).max(1000).optional(),
    validateOnly: z.boolean().default(true),
    trainingMode: z.boolean().default(false)
  };
}

function recipientSchema() {
  return z.object({
    phone: z.string().min(8).max(32),
    name: z.string().max(120).optional(),
    consentSource: z.string().min(3).max(160).optional(),
    consentAt: z.string().datetime().optional(),
    tags: z.array(z.string().max(60)).max(20).optional(),
    optedOut: z.boolean().default(false)
  });
}

function textResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}
