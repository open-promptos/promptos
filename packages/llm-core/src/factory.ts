// packages/llm-core/src/factory.ts
import { LLMClient, LLMConfig } from "./types";
import { OpenAICompatibleClient } from "./openaiCompatibleClient";

/**
 * Create an LLM client from a given configuration.
 * 根据给定配置创建对应的 LLM 客户端实例。
 */
export function createLLMClient(config: LLMConfig): LLMClient {
  switch (config.provider) {
    case "openai":
    case "openai-compatible":
    case "groq":
    case "grok":
      return new OpenAICompatibleClient(config);

    // Future: handle Anthropic / Google / DeepSeek etc.
    // 未来：在此添加 Anthropic / Google / DeepSeek 等实现。
    default:
      throw new Error(
        `Unsupported provider "${config.provider}" in createLLMClient. ` +
          `Currently supported: "openai", "openai-compatible", "groq", "grok".`,
      );
  }
}
