// packages/llm-core/src/config.ts
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  BaseLLMConfig,
  LLMConfig,
  LLMProvider,
  OpenAICompatibleConfig,
} from "./types";

/**
 * Default model when none is provided.
 */
const DEFAULT_MODEL = "gpt-4o-mini";

/**
 * Interface for a partial config loaded from a source.
 * 从某个源加载的配置片段，允许字段缺失。
 */
interface PartialConfig {
  provider?: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

/**
 * 1. Try to load from Environment Variables.
 * 尝试从环境变量加载配置。
 */
function loadFromEnv(): PartialConfig {
  const providerRaw = process.env.LLM_PROVIDER?.trim();
  const provider = providerRaw
    ? (providerRaw.toLowerCase() as LLMProvider)
    : undefined;

  // Try generic or specific env vars
  const isGroq = provider === "groq";
  const apiKey =
    (isGroq ? process.env.GROQ_API_KEY : undefined) ||
    process.env.LLM_API_KEY ||
    process.env.OPENAI_API_KEY;

  const baseUrl = process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL;
  const model = process.env.LLM_MODEL;

  return { provider, apiKey, baseUrl, model };
}

/**
 * 2. Try to load from Dotfile (~/.promptos/config.json).
 * 尝试从用户主目录的配置文件加载。
 */
function loadFromDotfile(): PartialConfig {
  try {
    const homeDir = os.homedir();
    const configPath = path.join(homeDir, ".promptos", "config.json");

    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf-8");
      const json = JSON.parse(content);
      // Basic validation/mapping could happen here
      return {
        provider: json.provider,
        apiKey: json.apiKey,
        baseUrl: json.baseUrl,
        model: json.model,
      };
    }
  } catch (error) {
    // Ignore read errors, just treat as missing
    // 忽略读取错误（文件不存在或格式错误），视为无配置
  }
  return {};
}

/**
 * Resolve the final configuration by merging sources.
 * Priority: Env > Dotfile > Defaults
 * * 解析最终配置。优先级：环境变量 > 配置文件 > 默认值。
 */
export function loadConfig(override?: Partial<LLMConfig>): LLMConfig {
  const envConfig = loadFromEnv();
  const fileConfig = loadFromDotfile();

  // Merge logic: Override > Env > File > Default
  // 合并逻辑：手动传入 > 环境变量 > 配置文件 > 默认值
  const providerRaw =
    override?.provider || envConfig.provider || fileConfig.provider || "openai"; // Default provider

  const provider = providerRaw as LLMProvider;

  const isGroq = provider === "groq";

  const apiKey = override?.apiKey || envConfig.apiKey || fileConfig.apiKey;

  let baseUrl =
    override?.baseUrl ||
    envConfig.baseUrl ||
    fileConfig.baseUrl ||
    (isGroq ? "https://api.groq.com/openai/v1" : "https://api.openai.com/v1");

  // Clean URL
  baseUrl = baseUrl.replace(/\/+$/, "");

  const model =
    override?.model || envConfig.model || fileConfig.model || DEFAULT_MODEL;

  // Validation
  if (!apiKey) {
    throw new Error(
      `PromptOS Configuration Error: Missing API Key.\n` +
        `Please set "LLM_API_KEY" in environment or "apiKey" in ~/.promptos/config.json\n` +
        `Provider: ${provider}`,
    );
  }

  // Construct final object based on provider type
  // 目前主要支持 OpenAI 兼容格式，未来可根据 provider 分支
  const finalConfig: OpenAICompatibleConfig = {
    provider,
    apiKey,
    baseUrl,
    model,
  };

  return finalConfig;
}

/**
 * @deprecated Use loadConfig() instead.
 * 保持兼容性，但建议使用新的 loadConfig。
 */
export function configFromEnv(): LLMConfig {
  return loadConfig();
}
