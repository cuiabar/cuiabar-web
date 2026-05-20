export function buildMessageVariants(input) {
    const signature = "Equipe Cuiabar";
    const offer = input.offer ? ` ${input.offer.trim()}` : "";
    const optOutText = input.optOutText || "Responda SAIR para nao receber novas mensagens.";
    const styles = {
        direto: ["Oi{nome}, passando para avisar:", "Boa noticia{nome}:", "Aviso rapido{nome}:"],
        cordial: ["Oi{nome}, tudo bem? Temos uma novidade:", "Ola{nome}! Passando por aqui com um convite:", "Oi{nome}! Se fizer sentido para voce:"],
        premium: ["Ola{nome}, preparamos uma comunicacao especial:", "Oi{nome}, uma selecao especial para voce:", "Ola{nome}, convite especial da casa:"],
        urgente_suave: ["Oi{nome}, lembrete rapido:", "Ola{nome}, ainda da tempo:", "Oi{nome}, passando antes que acabe:"]
    };
    const openings = styles[input.tone];
    const variants = Array.from({ length: input.variantCount }, (_, index) => {
        const opening = openings[index % openings.length];
        return normalizeWhitespace(`${opening} ${input.baseMessage.trim()}${offer}\n\n${signature}\n${optOutText}`);
    });
    return {
        ok: true,
        campaignName: input.campaignName,
        audience: input.audience,
        policy: compliancePolicy(),
        variants
    };
}
export function buildCampaignPlan(input, config) {
    const validation = validateCampaignInput(input, config);
    const delaySeconds = Math.max(input.minDelaySeconds ?? config.minDelaySeconds, config.minDelaySeconds);
    const start = input.startAt ? new Date(input.startAt) : new Date(Date.now() + 5 * 60 * 1000);
    const eligibleRecipients = isTrainingOrValidation(input) ? input.recipients : input.recipients.filter((recipient) => !recipient.optedOut);
    const schedule = eligibleRecipients.slice(0, config.maxBatchSize).map((recipient, index) => {
        const scheduledAt = new Date(start.getTime() + index * delaySeconds * 1000);
        return {
            recipient,
            variantIndex: index % input.variants.length,
            text: personalize(input.variants[index % input.variants.length], recipient),
            scheduledAt: scheduledAt.toISOString()
        };
    });
    return {
        ok: validation.errors.length === 0,
        mode: "plan-only",
        campaignName: input.campaignName,
        policy: compliancePolicy(input),
        validation,
        limits: {
            maxBatchSize: config.maxBatchSize,
            minDelaySeconds: config.minDelaySeconds,
            maxDailyRecipients: input.maxDailyRecipients ?? config.maxDailyRecipients,
            quietHoursStart: input.quietHoursStart,
            quietHoursEnd: input.quietHoursEnd
        },
        schedule,
        nextStep: isTrainingOrValidation(input)
            ? "Plano gerado em modo de treino/validacao. Nao executa envio nem exige comprovante de consentimento neste modo."
            : "Envio em massa nao e executado por request unico. Use este plano em um dispatcher auditavel que respeite opt-out, quiet hours, limite diario e consentimento."
    };
}
export async function sendSingleMarketingMessage(bridge, input) {
    const trainingOrValidation = isTrainingOrValidation(input);
    const errors = validateRecipient(input.recipient, { requireConsent: !trainingOrValidation, honorOptOut: !trainingOrValidation });
    const textErrors = trainingOrValidation ? [] : validateMarketingText(input.text);
    const allErrors = [...errors, ...textErrors];
    if (allErrors.length > 0) {
        return { ok: false, mode: "blocked", errors: allErrors };
    }
    const text = personalize(input.text, input.recipient);
    if (input.validateOnly !== false) {
        return {
            ok: true,
            mode: input.trainingMode ? "training" : "validate-only",
            recipient: input.recipient.phone,
            text,
            policy: compliancePolicy(input)
        };
    }
    if (input.confirmWrite !== "ENVIAR_WHATSAPP_CONSENTIDO") {
        return {
            ok: false,
            mode: "blocked",
            error: 'Para envio real, envie confirmWrite="ENVIAR_WHATSAPP_CONSENTIDO".'
        };
    }
    try {
        return {
            ok: true,
            mode: "sent",
            recipient: input.recipient.phone,
            response: await bridge.sendText(input.recipient.phone, text)
        };
    }
    catch (error) {
        return {
            ok: false,
            mode: "send-failed",
            recipient: input.recipient.phone,
            error: error instanceof Error ? error.message : String(error),
            retryable: true
        };
    }
}
export function formatWhatsAppMarketingMessage(input) {
    const text = buildFormattedText(input);
    return {
        ok: Boolean(text),
        text,
        format: {
            title: "bold",
            body: "italic",
            quotes: "blockquote"
        },
        example: "*Titulo*\n\n_Corpo_\n\n> Preco ou informacao util"
    };
}
export async function sendSingleMarketingMedia(bridge, input) {
    const trainingOrValidation = isTrainingOrValidation(input);
    const errors = validateRecipient(input.recipient, { requireConsent: !trainingOrValidation, honorOptOut: !trainingOrValidation });
    const sourceErrors = validateMediaInput(input);
    const caption = input.caption ?? buildFormattedText(input);
    const textErrors = trainingOrValidation ? [] : validateMarketingText(caption);
    const allErrors = [...errors, ...sourceErrors, ...textErrors];
    if (allErrors.length > 0) {
        return { ok: false, mode: "blocked", errors: allErrors };
    }
    const personalizedCaption = personalize(caption, input.recipient);
    if (input.validateOnly !== false) {
        return {
            ok: true,
            mode: input.trainingMode ? "training" : "validate-only",
            recipient: input.recipient.phone,
            mediaType: input.mediaType,
            source: input.mediaUrl ? "mediaUrl" : "filePath",
            caption: personalizedCaption,
            policy: compliancePolicy(input)
        };
    }
    if (input.confirmWrite !== "ENVIAR_WHATSAPP_MIDIA_CONSENTIDA") {
        return {
            ok: false,
            mode: "blocked",
            error: 'Para envio real de midia, envie confirmWrite="ENVIAR_WHATSAPP_MIDIA_CONSENTIDA".'
        };
    }
    try {
        return {
            ok: true,
            mode: "sent",
            recipient: input.recipient.phone,
            response: await bridge.sendMedia({
                recipient: input.recipient.phone,
                mediaType: input.mediaType,
                filePath: input.filePath,
                mediaUrl: input.mediaUrl,
                caption: personalizedCaption,
                fileName: input.fileName,
                mimeType: input.mimeType,
                asVoice: input.asVoice
            })
        };
    }
    catch (error) {
        return {
            ok: false,
            mode: "send-failed",
            recipient: input.recipient.phone,
            error: error instanceof Error ? error.message : String(error),
            retryable: true
        };
    }
}
export async function sendNumberedMenu(bridge, input) {
    const trainingOrValidation = isTrainingOrValidation(input);
    const errors = [
        ...validateRecipient(input.recipient, { requireConsent: !trainingOrValidation, honorOptOut: !trainingOrValidation }),
        ...validateNumberedMenu(input)
    ];
    if (errors.length > 0) {
        return { ok: false, mode: "blocked", errors };
    }
    const menuText = formatNumberedMenu(input);
    if (input.validateOnly !== false) {
        return {
            ok: true,
            mode: input.trainingMode ? "training" : "validate-only",
            recipient: input.recipient.phone,
            menuText,
            behavior: "O proximo numero valido respondido pelo cliente aciona uma resposta unica e encerra a sessao.",
            options: input.options.map((option, index) => ({ number: index + 1, label: option.label, responseText: option.responseText })),
            policy: compliancePolicy(input)
        };
    }
    if (input.confirmWrite !== "ENVIAR_MENU_NUMERADO") {
        return {
            ok: false,
            mode: "blocked",
            error: 'Para envio real do menu numerado, envie confirmWrite="ENVIAR_MENU_NUMERADO".'
        };
    }
    try {
        return {
            ok: true,
            mode: "sent",
            recipient: input.recipient.phone,
            response: await bridge.sendNumberedMenu({
                recipient: input.recipient.phone,
                title: input.title,
                body: personalize(input.body, input.recipient),
                options: input.options.map((option) => ({
                    label: option.label,
                    responseText: personalize(option.responseText, input.recipient)
                })),
                footer: input.footer,
                invalidResponseText: input.invalidResponseText,
                expiresInMinutes: input.expiresInMinutes
            })
        };
    }
    catch (error) {
        return {
            ok: false,
            mode: "send-failed",
            recipient: input.recipient.phone,
            error: error instanceof Error ? error.message : String(error),
            retryable: true
        };
    }
}
function validateCampaignInput(input, config) {
    const errors = [];
    const warnings = [];
    const trainingOrValidation = isTrainingOrValidation(input);
    if (input.recipients.length > config.maxBatchSize) {
        errors.push(`Campanha excede MARKETING_MAX_BATCH_SIZE=${config.maxBatchSize}.`);
    }
    for (const [index, recipient] of input.recipients.entries()) {
        validateRecipient(recipient, { requireConsent: !trainingOrValidation, honorOptOut: !trainingOrValidation }).forEach((error) => errors.push(`recipients[${index}]: ${error}`));
    }
    if (!trainingOrValidation) {
        input.variants.forEach((variant, index) => {
            validateMarketingText(variant).forEach((error) => errors.push(`variants[${index}]: ${error}`));
        });
    }
    if ((input.minDelaySeconds ?? config.minDelaySeconds) < config.minDelaySeconds) {
        errors.push(`minDelaySeconds precisa ser >= ${config.minDelaySeconds}.`);
    }
    if ((input.maxDailyRecipients ?? config.maxDailyRecipients) > config.maxDailyRecipients) {
        errors.push(`maxDailyRecipients precisa ser <= ${config.maxDailyRecipients}.`);
    }
    if (input.validateOnly === false) {
        warnings.push("Este endpoint nao envia lote; ele retorna plano para dispatcher auditavel.");
    }
    if (trainingOrValidation) {
        warnings.push("Modo de treino/validacao: consentimento, opt-out e identificacao textual nao sao exigidos porque nao ha envio real.");
    }
    return {
        errors,
        warnings,
        eligibleRecipients: input.recipients.filter((recipient) => !recipient.optedOut).length,
        optedOutRecipients: input.recipients.filter((recipient) => recipient.optedOut).length
    };
}
function validateRecipient(recipient, options) {
    const errors = [];
    if (options.honorOptOut && recipient.optedOut) {
        errors.push("destinatario marcou opt-out.");
    }
    if (options.requireConsent && (!recipient.consentSource || recipient.consentSource.trim().length < 3)) {
        errors.push("consentSource e obrigatorio.");
    }
    if (!/^\+?\d{8,15}$/.test(recipient.phone.replace(/\s/g, ""))) {
        errors.push("phone precisa estar em formato telefonico valido.");
    }
    return errors;
}
function validateMarketingText(text) {
    const errors = [];
    const normalized = text.toLowerCase();
    if (!normalized.includes("sair") && !normalized.includes("opt-out") && !normalized.includes("parar")) {
        errors.push("mensagem precisa conter orientacao de opt-out, por exemplo: Responda SAIR.");
    }
    if (!normalized.includes("cuiabar") && !normalized.includes("equipe")) {
        errors.push("mensagem precisa identificar claramente o remetente.");
    }
    return errors;
}
function validateMediaInput(input) {
    const errors = [];
    if (Boolean(input.filePath) === Boolean(input.mediaUrl)) {
        errors.push("informe exatamente uma origem de midia: filePath ou mediaUrl.");
    }
    if (input.mediaUrl) {
        try {
            const url = new URL(input.mediaUrl);
            if (url.protocol !== "https:") {
                errors.push("mediaUrl precisa usar HTTPS.");
            }
        }
        catch {
            errors.push("mediaUrl invalida.");
        }
    }
    if (!input.caption && !buildFormattedText(input)) {
        errors.push("caption ou campos formatados sao obrigatorios.");
    }
    return errors;
}
function validateNumberedMenu(input) {
    const errors = [];
    if (input.options.length < 1 || input.options.length > 10) {
        errors.push("menu numerado precisa ter entre 1 e 10 opcoes.");
    }
    input.options.forEach((option, index) => {
        if (!option.label.trim()) {
            errors.push(`options[${index}].label e obrigatorio.`);
        }
        if (!option.responseText.trim()) {
            errors.push(`options[${index}].responseText e obrigatorio.`);
        }
    });
    return errors;
}
function buildFormattedText(input) {
    const sections = [];
    const title = cleanLine(input.title);
    const body = cleanBlock(input.body);
    const quotes = (input.quotes ?? []).map(cleanLine).filter(Boolean);
    const footer = cleanBlock(input.footer);
    if (title) {
        sections.push(`*${title}*`);
    }
    if (body) {
        sections.push(`_${body}_`);
    }
    if (quotes.length > 0) {
        sections.push(quotes.map((quote) => `> ${quote}`).join("\n"));
    }
    if (footer) {
        sections.push(footer);
    }
    return normalizeWhitespace(sections.join("\n\n"));
}
function formatNumberedMenu(input) {
    const sections = [];
    const title = cleanLine(input.title);
    const body = cleanBlock(input.body);
    const footer = cleanBlock(input.footer);
    if (title) {
        sections.push(`*${title}*`);
    }
    sections.push(body);
    sections.push(input.options.map((option, index) => `${index + 1}. ${cleanLine(option.label)}`).join("\n"));
    if (footer) {
        sections.push(footer);
    }
    sections.push("Responda somente com o numero da opcao.");
    return normalizeWhitespace(sections.join("\n\n"));
}
function personalize(text, recipient) {
    const firstName = recipient.name?.trim().split(/\s+/)[0] ?? "";
    return normalizeWhitespace(text.replace(/\{nome\}/g, firstName ? ` ${firstName}` : ""));
}
function isTrainingOrValidation(input) {
    return input.trainingMode === true || input.validateOnly !== false;
}
function normalizeWhitespace(value) {
    return value.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
function cleanLine(value) {
    return cleanBlock(value).replace(/\s+/g, " ").trim();
}
function cleanBlock(value) {
    return (value ?? "").replace(/\r\n/g, "\n").trim();
}
function compliancePolicy(input) {
    const trainingOrValidation = input ? isTrainingOrValidation(input) : false;
    return {
        trainingMode: trainingOrValidation,
        requiredConsent: !trainingOrValidation,
        requiredOptOut: !trainingOrValidation,
        identifySender: !trainingOrValidation,
        relaxedForTraining: trainingOrValidation,
        noBlockEvasion: true,
        noPurchasedLists: true,
        noMisleadingIdentity: true,
        humanReviewRecommended: true
    };
}
