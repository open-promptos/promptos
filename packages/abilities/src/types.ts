// packages/abilities/src/types.ts

/**
 * Metadata definition for a PromptOS Ability.
 * PromptOS 能力元数据的核心定义。
 */
export interface AbilityMeta {
  /**
   * Unique identifier for the ability.
   * New Architecture: The primary key (e.g. "code.review.api").
   */
  id: string;

  /**
   * Human-readable description.
   */
  description: string;

  /**
   * Hint for arguments passed in parentheses.
   * e.g. "style? (strict, concise)"
   */
  argsHint?: string;

  /**
   * Prompt generation strategy.
   */
  strategy: "static" | "llm";

  /**
   * Raw template for static strategy.
   */
  staticPromptTemplate?: string;

  /**
   * Example usages for documentation/discovery.
   */
  examples?: {
    dsl: string;
    description?: string;
  }[];

  /**
   * Additional hints for the prompt generation.
   */
  promptHints?: string[];

  /**
   * Supported programming languages (lowercase).
   */
  supportedLanguages?: string[];

  /**
   * Specific hints per language.
   */
  languageSpecificHints?: Record<string, string>;

  // --- Legacy Compatibility (Optional) ---
  // 保留这些可选字段，仅为了不破坏可能存在的旧日志或分析工具，
  // 但核心逻辑中不再依赖它们。
  domain?: string;
  subdomain?: string;
  action?: string;
}
