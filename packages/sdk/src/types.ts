// packages/sdk/src/types.ts
import type { ParsedDSL } from "@promptos/dsl-core";
import type { AbilityMeta, UserProfile } from "@promptos/prompt-writer";

/**
 * Arguments for generatePrompt, passed by the host (VSCode / CLI / Node).
 * 宿主（VSCode / CLI / Node）传入 generatePrompt 的参数。
 */
export interface GeneratePromptArgs {
  /** Raw DSL string, e.g. "code(my-api.ts).review.api(strict)". 原始 DSL 字符串 */
  dsl: string;

  /** Optional selected text from the host (e.g. editor selection). 宿主传入的选中文本（例如编辑器选区） */
  selectedText?: string;

  /** Current user profile. 当前用户画像 */
  userProfile: UserProfile;

  /**
   * Additional task note from the host.
   * 宿主传入的额外说明，将合并进结构化 taskNote 的 [Additional Note] 区块。
   */
  taskNote?: string;

  /**
   * Optional override for the Prompt Writer system prompt (LLM strategy only).
   * 可选的 Prompt Writer system prompt 覆盖文本（仅在 LLM 策略下使用）。
   */
  systemPromptOverride?: string;
}

/**
 * Result of generatePrompt.
 * generatePrompt 的返回结果。
 */
export interface GeneratePromptResult {
  /** Final prompt text to be sent to an LLM / agent runtime. 最终生成的 Prompt 文本 */
  prompt: string;

  /** Extra metadata for the host. 返回给宿主的额外元信息 */
  meta: {
    /** Parsed DSL structure. 解析后的 DSL 结构 */
    parsedDsl: ParsedDSL;
    /** Resolved ability metadata. 解析到的能力元数据 */
    ability: AbilityMeta;
    /** Original selected text (if any). 原始选中文本（如有） */
    selectedText?: string;
  };
}
