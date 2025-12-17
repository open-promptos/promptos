"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLLMClient = createLLMClient;
const openaiCompatibleClient_1 = require("./openaiCompatibleClient");
/**
 * Create an LLM client from a given configuration.
 * 根据给定配置创建对应的 LLM 客户端实例。
 */
function createLLMClient(config) {
    switch (config.provider) {
        case "openai":
        case "openai-compatible":
        case "groq":
        case "grok":
            return new openaiCompatibleClient_1.OpenAICompatibleClient(config);
        // Future: handle Anthropic / Google / DeepSeek etc.
        // 未来：在此添加 Anthropic / Google / DeepSeek 等实现。
        default:
            throw new Error(`Unsupported provider "${config.provider}" in createLLMClient. ` +
                `Currently supported: "openai", "openai-compatible", "groq", "grok".`);
    }
}
//# sourceMappingURL=factory.js.map