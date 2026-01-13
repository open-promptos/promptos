import { LLMConfig } from "@promptos/llm-core";
/**
 * Compiles a raw user intent into a structured .pos YAML string using an LLM.
 * 使用 LLM 将用户的原始意图编译为结构化的 .pos YAML 字符串。
 *
 * @param userIntent The raw text from the user (e.g., "Write a snake game in python")
 * @param config Configuration for the LLM provider (API keys, model, etc.)
 * @returns A Promise resolving to the YAML string.
 */
export declare function compileIntentToPos(userIntent: string, config: LLMConfig): Promise<string>;
