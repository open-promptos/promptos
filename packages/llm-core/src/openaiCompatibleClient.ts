// packages/llm-core/src/openaiCompatibleClient.ts
import {
  LLMChatOptions,
  LLMChatResult,
  LLMClient,
  LLMMessage,
  OpenAICompatibleConfig,
} from "./types";

/**
 * A minimal OpenAI-compatible chat client using global fetch.
 * 使用全局 fetch 的最小 OpenAI 兼容聊天客户端。
 *
 * - Compatible with OpenAI / openai-compatible / Groq / Grok style `/chat/completions` endpoints.
 * - 兼容 OpenAI / openai-compatible / Groq / Grok 风格的 `/chat/completions` 端点。
 */
export class OpenAICompatibleClient implements LLMClient {
  private readonly config: OpenAICompatibleConfig;

  constructor(config: OpenAICompatibleConfig) {
    this.config = config;
  }

  async chat(
    messages: LLMMessage[],
    options?: LLMChatOptions,
  ): Promise<LLMChatResult> {
    const fetchFn: any = (globalThis as any).fetch;
    if (typeof fetchFn !== "function") {
      throw new Error(
        "Global fetch is not available. Please run on Node 18+ or provide a fetch polyfill.",
      );
    }

    const baseUrl = this.config.baseUrl ?? "https://api.openai.com/v1";
    const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

    const body: Record<string, unknown> = {
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
      throw new Error(
        `OpenAI-compatible chat call failed with status ${res.status}: ${
          text || res.statusText
        }`,
      );
    }

    const json: any = await res.json();
    const choice = json.choices?.[0];

    const content: string = choice?.message?.content ?? "";
    const model: string | undefined = json.model;
    const finishReason: string | undefined = choice?.finish_reason;

    return {
      content: content.trim(),
      raw: json,
      model,
      finishReason,
    };
  }
}
