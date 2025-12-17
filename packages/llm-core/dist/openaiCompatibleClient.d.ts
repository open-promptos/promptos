import { LLMChatOptions, LLMChatResult, LLMClient, LLMMessage, OpenAICompatibleConfig } from "./types";
/**
 * A minimal OpenAI-compatible chat client using global fetch.
 * 使用全局 fetch 的最小 OpenAI 兼容聊天客户端。
 *
 * - Compatible with OpenAI / openai-compatible / Groq / Grok style `/chat/completions` endpoints.
 * - 兼容 OpenAI / openai-compatible / Groq / Grok 风格的 `/chat/completions` 端点。
 */
export declare class OpenAICompatibleClient implements LLMClient {
    private readonly config;
    constructor(config: OpenAICompatibleConfig);
    chat(messages: LLMMessage[], options?: LLMChatOptions): Promise<LLMChatResult>;
}
