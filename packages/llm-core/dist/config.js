"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configFromEnv = configFromEnv;
/**
 * Default model when none is provided.
 * 未显式配置模型时使用的默认模型名称。
 */
const DEFAULT_MODEL = "gpt-4o-mini";
/**
 * Resolve provider from environment variables.
 * 从环境变量中解析提供商标识。
 */
function resolveProviderFromEnv() {
    const raw = process.env.LLM_PROVIDER?.trim();
    if (!raw) {
        return "openai";
    }
    // narrow to known providers if possible
    const lower = raw.toLowerCase();
    return lower;
}
/**
 * Build config for OpenAI-compatible providers.
 * 为 OpenAI 兼容提供商构建配置。
 */
function buildOpenAICompatibleConfig(provider) {
    const isGroq = provider === "groq";
    // API key resolution
    // API 密钥解析顺序
    const apiKey = (isGroq ? process.env.GROQ_API_KEY : undefined) ||
        process.env.LLM_API_KEY ||
        process.env.OPENAI_API_KEY ||
        "";
    if (!apiKey) {
        throw new Error(`Missing API key for provider "${provider}". ` +
            `Please set GROQ_API_KEY / LLM_API_KEY / OPENAI_API_KEY.`);
    }
    // Base URL resolution
    // 基础 URL 解析
    let baseUrl = process.env.LLM_BASE_URL ||
        process.env.OPENAI_BASE_URL ||
        (isGroq ? "https://api.groq.com/openai/v1" : "https://api.openai.com/v1");
    // Remove trailing slash for predictable concatenation
    // 去掉末尾斜杠，便于后续拼接路径
    baseUrl = baseUrl.replace(/\/+$/, "");
    const model = process.env.LLM_MODEL || DEFAULT_MODEL;
    const baseConfig = {
        provider,
        apiKey,
        baseUrl,
        model,
    };
    return baseConfig;
}
/**
 * Build LLM configuration from environment variables.
 * 从环境变量构建 LLM 配置。
 *
 * - LLM_PROVIDER (default: "openai")
 * - LLM_API_KEY / OPENAI_API_KEY
 * - LLM_BASE_URL / OPENAI_BASE_URL (default: https://api.openai.com/v1)
 * - LLM_MODEL (default: gpt-4o-mini)
 * - GROQ_API_KEY (when provider = "groq")
 */
function configFromEnv() {
    const provider = resolveProviderFromEnv();
    switch (provider) {
        case "openai":
        case "openai-compatible":
        case "groq":
        case "grok":
            return buildOpenAICompatibleConfig(provider);
        // Future providers can have their own builders.
        // 未来可为其他提供商实现专用配置构建器。
        case "anthropic":
        case "google":
        case "deepseek":
        default:
            throw new Error(`Unsupported LLM provider "${provider}". ` +
                `Currently supported: "openai", "openai-compatible", "groq", "grok".`);
    }
}
//# sourceMappingURL=config.js.map