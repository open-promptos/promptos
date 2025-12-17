import type { GeneratePromptArgs, GeneratePromptResult } from "./types";
/**
 * Generate a prompt from DSL + selected text + user profile.
 * 根据 DSL + 选中文本 + 用户画像生成 Prompt。
 */
export declare function generatePrompt(args: GeneratePromptArgs): Promise<GeneratePromptResult>;
