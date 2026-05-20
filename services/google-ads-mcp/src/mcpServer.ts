import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GoogleAdsClient, normalizeCustomerId, type MutateOperation } from "./googleAdsClient.js";

type McpMetadata = {
  localUrl?: string;
  publicUrl?: string;
  apiVersion: string;
};

const writeConfirmationLiteral = "CRIAR_PUBLICIDADE_GOOGLE_ADS";
const finalUrlSchema = z.string().url().refine((value) => value.startsWith("https://"), {
  message: "A URL final deve usar HTTPS."
});
const headlineSchema = z.string().trim().min(1).max(30);
const descriptionSchema = z.string().trim().min(1).max(90);
const keywordSchema = z.object({
  text: z.string().trim().min(1).max(80),
  matchType: z.enum(["EXACT", "PHRASE", "BROAD"]).default("PHRASE")
});

export function createGoogleAdsMcpServer(googleAds: GoogleAdsClient, metadata: McpMetadata): McpServer {
  const server = new McpServer({
    name: "cuiabar-google-ads",
    version: "0.1.0"
  });

  server.registerTool(
    "get_accessible_customers",
    {
      title: "Listar contas acessiveis",
      description: "Lista customer IDs do Google Ads acessiveis pelo OAuth configurado.",
      inputSchema: {}
    },
    async () => textResult(await googleAds.listAccessibleCustomers())
  );

  server.registerTool(
    "list_campaigns",
    {
      title: "Listar campanhas",
      description: "Lista campanhas com status, tipo, estrategia de lance e orcamento.",
      inputSchema: {
        customerId: z.string().optional(),
        limit: z.number().int().min(1).max(500).default(100)
      }
    },
    async ({ customerId, limit }) =>
      textResult(
        await googleAds.searchStream(
          `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign.bidding_strategy_type, campaign_budget.id, campaign_budget.name, campaign_budget.amount_micros FROM campaign ORDER BY campaign.name LIMIT ${limit}`,
          customerId
        )
      )
  );

  server.registerTool(
    "get_campaign_metrics",
    {
      title: "Metricas de campanhas",
      description: "Consulta impressoes, cliques, custo, conversoes, CTR e CPC por campanha.",
      inputSchema: {
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        customerId: z.string().optional(),
        campaignId: z.string().optional(),
        limit: z.number().int().min(1).max(1000).default(250)
      }
    },
    async ({ startDate, endDate, customerId, campaignId, limit }) => {
      const where = [
        `segments.date BETWEEN '${startDate}' AND '${endDate}'`,
        campaignId ? `campaign.id = ${campaignId.replace(/\D/g, "")}` : null
      ]
        .filter(Boolean)
        .join(" AND ");

      return textResult(
        await googleAds.searchStream(
          `SELECT campaign.id, campaign.name, campaign.status, segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.ctr, metrics.average_cpc FROM campaign WHERE ${where} ORDER BY segments.date DESC LIMIT ${limit}`,
          customerId
        )
      );
    }
  );

  server.registerTool(
    "get_ad_groups",
    {
      title: "Grupos de anuncios",
      description: "Lista grupos de anuncios por campanha.",
      inputSchema: {
        customerId: z.string().optional(),
        campaignId: z.string().optional(),
        limit: z.number().int().min(1).max(1000).default(250)
      }
    },
    async ({ customerId, campaignId, limit }) => {
      const where = campaignId ? ` WHERE campaign.id = ${campaignId.replace(/\D/g, "")}` : "";
      return textResult(
        await googleAds.searchStream(
          `SELECT campaign.id, campaign.name, ad_group.id, ad_group.name, ad_group.status, ad_group.type FROM ad_group${where} ORDER BY campaign.name, ad_group.name LIMIT ${limit}`,
          customerId
        )
      );
    }
  );

  server.registerTool(
    "get_ads",
    {
      title: "Anuncios",
      description: "Lista anuncios, status e textos principais quando disponiveis.",
      inputSchema: {
        customerId: z.string().optional(),
        campaignId: z.string().optional(),
        limit: z.number().int().min(1).max(1000).default(250)
      }
    },
    async ({ customerId, campaignId, limit }) => {
      const where = campaignId ? ` WHERE campaign.id = ${campaignId.replace(/\D/g, "")}` : "";
      return textResult(
        await googleAds.searchStream(
          `SELECT campaign.id, campaign.name, ad_group.id, ad_group.name, ad_group_ad.ad.id, ad_group_ad.status, ad_group_ad.ad.type, ad_group_ad.ad.final_urls, ad_group_ad.ad.responsive_search_ad.headlines, ad_group_ad.ad.responsive_search_ad.descriptions FROM ad_group_ad${where} ORDER BY campaign.name, ad_group.name LIMIT ${limit}`,
          customerId
        )
      );
    }
  );

  server.registerTool(
    "get_keywords",
    {
      title: "Palavras-chave",
      description: "Lista palavras-chave, correspondencia, status e metricas no periodo.",
      inputSchema: {
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        customerId: z.string().optional(),
        limit: z.number().int().min(1).max(1000).default(250)
      }
    },
    async ({ startDate, endDate, customerId, limit }) =>
      textResult(
        await googleAds.searchStream(
          `SELECT campaign.id, campaign.name, ad_group.id, ad_group.name, ad_group_criterion.criterion_id, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.status, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM keyword_view WHERE segments.date BETWEEN '${startDate}' AND '${endDate}' ORDER BY metrics.clicks DESC LIMIT ${limit}`,
          customerId
        )
      )
  );

  server.registerTool(
    "get_search_terms",
    {
      title: "Termos de busca",
      description: "Consulta termos reais pesquisados, campanha, grupo e metricas no periodo.",
      inputSchema: {
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        customerId: z.string().optional(),
        limit: z.number().int().min(1).max(1000).default(250)
      }
    },
    async ({ startDate, endDate, customerId, limit }) =>
      textResult(
        await googleAds.searchStream(
          `SELECT campaign.id, campaign.name, ad_group.id, ad_group.name, search_term_view.search_term, search_term_view.status, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM search_term_view WHERE segments.date BETWEEN '${startDate}' AND '${endDate}' ORDER BY metrics.clicks DESC LIMIT ${limit}`,
          customerId
        )
      )
  );

  server.registerTool(
    "get_geo_performance",
    {
      title: "Desempenho geografico",
      description: "Consulta desempenho por localizacao geografica no periodo.",
      inputSchema: {
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        customerId: z.string().optional(),
        limit: z.number().int().min(1).max(1000).default(250)
      }
    },
    async ({ startDate, endDate, customerId, limit }) =>
      textResult(
        await googleAds.searchStream(
          `SELECT geographic_view.country_criterion_id, geographic_view.location_type, campaign.id, campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM geographic_view WHERE segments.date BETWEEN '${startDate}' AND '${endDate}' ORDER BY metrics.clicks DESC LIMIT ${limit}`,
          customerId
        )
      )
  );

  server.registerTool(
    "get_budget_status",
    {
      title: "Status de orcamentos",
      description: "Lista orcamentos de campanha e valores configurados.",
      inputSchema: {
        customerId: z.string().optional(),
        limit: z.number().int().min(1).max(500).default(100)
      }
    },
    async ({ customerId, limit }) =>
      textResult(
        await googleAds.searchStream(
          `SELECT campaign_budget.id, campaign_budget.name, campaign_budget.status, campaign_budget.amount_micros, campaign_budget.total_amount_micros, campaign_budget.delivery_method, campaign_budget.explicitly_shared FROM campaign_budget ORDER BY campaign_budget.name LIMIT ${limit}`,
          customerId
        )
      )
  );

  server.registerTool(
    "run_readonly_gaql",
    {
      title: "Executar GAQL somente leitura",
      description: "Executa uma consulta GAQL SELECT. Mutacoes e comandos de escrita sao bloqueados.",
      inputSchema: {
        query: z.string().min(1).max(8000),
        customerId: z.string().optional()
      }
    },
    async ({ query, customerId }) => textResult(await googleAds.searchStream(query, customerId))
  );

  server.registerTool(
    "create_search_ad_bundle",
    {
      title: "Criar publicidade de pesquisa",
      description:
        "Cria um pacote de publicidade no Google Ads: orcamento diario, campanha Search, grupo de anuncios, palavras-chave e anuncio responsivo. Por padrao valida sem publicar; para criar de fato, envie validateOnly=false e confirmWrite='CRIAR_PUBLICIDADE_GOOGLE_ADS'.",
      inputSchema: {
        campaignName: z.string().trim().min(1).max(120),
        adGroupName: z.string().trim().min(1).max(120),
        finalUrls: z.array(finalUrlSchema).min(1).max(5),
        dailyBudgetMicros: z.number().int().min(1_000_000).max(5_000_000_000),
        headlines: z.array(headlineSchema).min(3).max(15),
        descriptions: z.array(descriptionSchema).min(2).max(4),
        keywords: z.array(keywordSchema).min(1).max(50),
        customerId: z.string().optional(),
        cpcBidMicros: z.number().int().min(10_000).max(100_000_000).optional(),
        campaignStatus: z.enum(["PAUSED", "ENABLED"]).default("PAUSED"),
        adGroupStatus: z.enum(["PAUSED", "ENABLED"]).default("PAUSED"),
        validateOnly: z.boolean().default(true),
        confirmWrite: z.literal(writeConfirmationLiteral).optional()
      }
    },
    async (input) => {
      if (!input.validateOnly && input.confirmWrite !== writeConfirmationLiteral) {
        throw new Error(
          `Para criar publicidade de fato, envie confirmWrite="${writeConfirmationLiteral}". Use validateOnly=true para apenas validar.`
        );
      }

      const customerId = normalizeCustomerId(input.customerId ?? googleAds.getDefaultCustomerId());
      const operations = buildSearchAdBundleOperations({
        customerId,
        campaignName: input.campaignName,
        adGroupName: input.adGroupName,
        finalUrls: input.finalUrls,
        dailyBudgetMicros: input.dailyBudgetMicros,
        headlines: input.headlines,
        descriptions: input.descriptions,
        keywords: input.keywords,
        cpcBidMicros: input.cpcBidMicros,
        campaignStatus: input.campaignStatus,
        adGroupStatus: input.adGroupStatus
      });

      return textResult(
        await googleAds.mutate(operations, customerId, {
          validateOnly: input.validateOnly,
          partialFailure: false
        })
      );
    }
  );

  server.registerResource(
    "install-info",
    "google-ads-mcp://install-info",
    {
      title: "Informacoes de instalacao",
      description: "Resumo de instalacao do MCP Google Ads read-only.",
      mimeType: "application/json"
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              service: "google-ads-mcp",
              mode: "read-write-controlled",
              localUrl: metadata.localUrl,
              publicUrl: metadata.publicUrl,
              apiVersion: metadata.apiVersion
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

type SearchAdBundleInput = {
  customerId: string;
  campaignName: string;
  adGroupName: string;
  finalUrls: string[];
  dailyBudgetMicros: number;
  headlines: string[];
  descriptions: string[];
  keywords: Array<{ text: string; matchType: "EXACT" | "PHRASE" | "BROAD" }>;
  cpcBidMicros?: number;
  campaignStatus: "PAUSED" | "ENABLED";
  adGroupStatus: "PAUSED" | "ENABLED";
};

export function buildSearchAdBundleOperations(input: SearchAdBundleInput): MutateOperation[] {
  const customerResource = input.customerId ? `customers/${input.customerId}` : "customers/{customer_id}";
  const budgetResourceName = `${customerResource}/campaignBudgets/-1`;
  const campaignResourceName = `${customerResource}/campaigns/-2`;
  const adGroupResourceName = `${customerResource}/adGroups/-3`;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  return [
    {
      campaignBudgetOperation: {
        create: {
          resourceName: budgetResourceName,
          name: `${input.campaignName} - budget ${timestamp}`,
          amountMicros: String(input.dailyBudgetMicros),
          deliveryMethod: "STANDARD",
          explicitlyShared: false
        }
      }
    },
    {
      campaignOperation: {
        create: {
          resourceName: campaignResourceName,
          name: `${input.campaignName} ${timestamp}`,
          status: input.campaignStatus,
          advertisingChannelType: "SEARCH",
          campaignBudget: budgetResourceName,
          manualCpc: {},
          networkSettings: {
            targetGoogleSearch: true,
            targetSearchNetwork: true,
            targetContentNetwork: false,
            targetPartnerSearchNetwork: false
          }
        }
      }
    },
    {
      adGroupOperation: {
        create: {
          resourceName: adGroupResourceName,
          name: input.adGroupName,
          campaign: campaignResourceName,
          status: input.adGroupStatus,
          type: "SEARCH_STANDARD",
          ...(input.cpcBidMicros ? { cpcBidMicros: String(input.cpcBidMicros) } : {})
        }
      }
    },
    ...input.keywords.map((keyword) => ({
      adGroupCriterionOperation: {
        create: {
          adGroup: adGroupResourceName,
          status: "ENABLED",
          keyword: {
            text: keyword.text,
            matchType: keyword.matchType
          }
        }
      }
    })),
    {
      adGroupAdOperation: {
        create: {
          adGroup: adGroupResourceName,
          status: "PAUSED",
          ad: {
            finalUrls: input.finalUrls,
            responsiveSearchAd: {
              headlines: input.headlines.map((text) => ({ text })),
              descriptions: input.descriptions.map((text) => ({ text }))
            }
          }
        }
      }
    }
  ];
}
