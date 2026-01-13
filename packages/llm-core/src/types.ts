// packages/llm-core/src/types.ts

/**
 * Supported LLM provider identifiers.
 * 支持的 LLM 提供商标识符。
 */
export type LLMProvider =
  | "openai"
  | "openai-compatible"
  | "anthropic"
  | "google"
  | "deepseek"
  | "grok"
  | "groq";

/**
 * Valid roles for LLM chat messages.
 * LLM 聊天消息中可用的角色。
 */
export type LLMRole = "system" | "user" | "assistant";

/**
 * Single chat message.
 * 单条聊天消息。
 */
export interface LLMMessage {
  role: LLMRole;
  content: string;
}

/**
 * Additional options for a chat call.
 * 聊天调用的附加选项。
 */
export interface LLMChatOptions {
  /** Override model for this call (falls back to config.model). 覆盖本次调用使用的模型 */
  model?: string;
  /** Temperature (0-2). 采样温度 */
  temperature?: number;
  /** Max tokens in response. 最多生成的 token 数 */
  maxTokens?: number;
  /** Stop sequences. 停止生成的触发序列 */
  stop?: string | string[];
  /**
   * Provider-specific options (e.g. extra headers or params).
   * 提供商相关的额外配置（如额外 header 或参数）。
   */
  metadata?: Record<string, unknown>;
}

/**
 * Result of a chat call.
 * 聊天调用的结果。
 */
export interface LLMChatResult {
  /** Final text content returned by the model. 模型返回的最终文本内容 */
  content: string;
  /** Underlying raw response object from provider. 来自底层提供商的原始响应对象 */
  raw: unknown;
  /** Model actually used by the provider. 实际使用的模型名称 */
  model?: string;
  /** Provider-specific finish reason, if available. 提供商返回的结束原因（如 stop / length） */
  finishReason?: string;
}

/**
 * LLM client abstraction: a minimal chat interface.
 * LLM 客户端抽象：最小聊天接口。
 */
export interface LLMClient {
  /**
   * Send a list of messages and receive a single reply.
   * 发送多条消息并接收单条回复。
   */
  chat(
    messages: LLMMessage[],
    options?: LLMChatOptions,
  ): Promise<LLMChatResult>;
}

/**
 * Base LLM configuration shared by all providers.
 * 所有提供商共享的基础 LLM 配置。
 */
export interface BaseLLMConfig {
  /** Provider identifier. 提供商标识符 */
  provider: LLMProvider;
  /** API key for authentication. 用于鉴权的 API 密钥 */
  apiKey: string;
  /** Base URL for HTTP API. HTTP API 的基础 URL */
  baseUrl?: string;
  /** Default model name. 默认模型名称 */
  model: string;
}

/**
 * Configuration for OpenAI-compatible providers (OpenAI / openai-compatible / Groq / Grok).
 * OpenAI 兼容提供商配置（OpenAI / openai-compatible / Groq / Grok）。
 */
export interface OpenAICompatibleConfig extends BaseLLMConfig {
  provider: LLMProvider;
}

/**
 * Union of all provider configs.
 * 所有提供商配置的联合类型。
 * 未来可在此扩展 Anthropic / Google 等专用配置。
 */
export type LLMConfig = OpenAICompatibleConfig; // | AnthropicConfig | GoogleConfig | ...
