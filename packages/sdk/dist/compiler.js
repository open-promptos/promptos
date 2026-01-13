"use strict";
// packages/sdk/src/compiler.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileIntentToPos = compileIntentToPos;
const llm_core_1 = require("@promptos/llm-core");
/**
 * Meta-prompt to instruct the LLM to act as the PromptOS Compiler.
 * 引导 LLM 充当 PromptOS 编译器的元提示词。
 */
const COMPILER_SYSTEM_PROMPT = `
You are the PromptOS Kernel (v0.2). Your goal is to function as an "Intent Compiler".
You accept a vague or raw user intent and "compile" it into a structured, high-quality PromptOS Definition file (.pos) in YAML format.

# output Schema (YAML)
The output must strictly adhere to this interface:
interface PromptOSFile {
  metadata: {
    name: string; // Snake case name (e.g. "python_snake_game")
    version: string; // Start with 0.1.0
    description?: string;
  };
  inputs: Array<{
    name: string;
    type: 'text' | 'select' | 'boolean';
    default?: string;
  }>;
  template: string; // The refined system prompt
}

# Instructions
1. Analyze the user's raw intent.
2. Infer necessary inputs (e.g., if user wants to review code, input should be 'source_code').
3. Construct a high-quality System Prompt (Action, Context, Constraints) in the 'template' field.
4. Return ONLY the valid YAML string within a markdown code block. Do not output explanations.
`;
/**
 * Compiles a raw user intent into a structured .pos YAML string using an LLM.
 * 使用 LLM 将用户的原始意图编译为结构化的 .pos YAML 字符串。
 *
 * @param userIntent The raw text from the user (e.g., "Write a snake game in python")
 * @param config Configuration for the LLM provider (API keys, model, etc.)
 * @returns A Promise resolving to the YAML string.
 */
async function compileIntentToPos(userIntent, config) {
    // Initialize the LLM client reusing the core factory
    // 复用核心工厂初始化 LLM 客户端
    const llm = (0, llm_core_1.createLLMClient)(config);
    // Construct the prompt messages
    const messages = [
        { role: "system", content: COMPILER_SYSTEM_PROMPT },
        { role: "user", content: `User Intent: "${userIntent}"` },
    ];
    try {
        // Call the LLM
        const response = await llm.chat(messages, {
            temperature: 0.2, // Low temperature for deterministic structure / 低温以保证结构稳定
        });
        let content = response.content || "";
        // Minimal cleaning to extract YAML if the model wraps it in markdown blocks
        // 简单的清洗逻辑：如果模型输出了 markdown 代码块，则提取其中的内容
        const yamlMatch = content.match(/```(?:yaml)?\n([\s\S]*?)\n```/);
        if (yamlMatch) {
            content = yamlMatch[1];
        }
        return content.trim();
    }
    catch (error) {
        throw new Error(`Compiler failed to refine prompt: ${error}`);
    }
}
//# sourceMappingURL=compiler.js.map