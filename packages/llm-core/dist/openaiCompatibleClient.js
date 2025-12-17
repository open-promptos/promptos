"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAICompatibleClient = void 0;
/**
 * A minimal OpenAI-compatible chat client using global fetch.
 * 使用全局 fetch 的最小 OpenAI 兼容聊天客户端。
 *
 * - Compatible with OpenAI / openai-compatible / Groq / Grok style `/chat/completions` endpoints.
 * - 兼容 OpenAI / openai-compatible / Groq / Grok 风格的 `/chat/completions` 端点。
 */
class OpenAICompatibleClient {
    constructor(config) {
        this.config = config;
    }
    async chat(messages, options) {
        const fetchFn = globalThis.fetch;
        if (typeof fetchFn !== "function") {
            throw new Error("Global fetch is not available. Please run on Node 18+ or provide a fetch polyfill.");
        }
        const baseUrl = this.config.baseUrl ?? "https://api.openai.com/v1";
        const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
        const body = {
            model: options?.model ?? this.config.model,
            messages: messages.map((m) => ({
                role: m.role,
                content: m.content,
            })),
        };
        if (typeof options?.temperature === "number") {
            body.temperature = options.temperature;
        }
        if (typeof options?.maxTokens === "number") {
            body.max_tokens = options.maxTokens;
        }
        if (typeof options?.stop !== "undefined") {
            body.stop = options.stop;
        }
        // Merge provider-specific metadata if needed
        // 合并可能存在的 provider 级 metadata 配置
        const metadata = options?.metadata ?? {};
        const res = await fetchFn(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.config.apiKey}`,
                ...(metadata && typeof metadata === "object" ? metadata : {}),
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`OpenAI-compatible chat call failed with status ${res.status}: ${text || res.statusText}`);
        }
        const json = await res.json();
        const choice = json.choices?.[0];
        const content = choice?.message?.content ?? "";
        const model = json.model;
        const finishReason = choice?.finish_reason;
        return {
            content: content.trim(),
            raw: json,
            model,
            finishReason,
        };
    }
}
exports.OpenAICompatibleClient = OpenAICompatibleClient;
//# sourceMappingURL=openaiCompatibleClient.js.map