import { LLMConfig } from "./types";
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
export declare function configFromEnv(): LLMConfig;
