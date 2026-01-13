"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMPromptWriter = void 0;
/**
 * Default system prompt for the Prompt Writer.
 * Prompt Writer 默认的 system prompt。
 */
const DEFAULT_SYSTEM_PROMPT = `
You are the PromptOS Prompt Writer.

Your ONLY job is to generate a single high-quality prompt text
that will later be sent to a powerful LLM or Agent runtime.

Requirements:
- ONLY output the final prompt text for the downstream LLM.
- DO NOT explain what you are doing.
- DO NOT add comments or meta instructions for the user.
- DO NOT wrap the prompt in markdown code fences or quotes.
- Respect the provided ability metadata, DSL structure, user profile and task note.
`.trim();
/**
 * LLMPromptWriter: uses an LLMClient to synthesize prompts.
 * 通过 LLMClient 调用大模型，综合能力元数据与 DSL 生成高质量 Prompt 的封装。
 */
class LLMPromptWriter {
    /**
     * @param client Underlying LLM client instance.
     *               底层 LLM 客户端实例。
     * @param defaultSystemTemplate Optional default system template.
     *                              可选默认 system 模板。
     */
    constructor(client, defaultSystemTemplate) {
        this.client = client;
        this.defaultSystemTemplate = defaultSystemTemplate;
    }
    /**
     * Write a high-quality prompt using the given input.
     * 使用给定输入生成高质量 Prompt。
     *
     * @returns The final prompt text only (no explanations).
     *          返回的字符串仅为最终 Prompt 文本（无解释说明）。
     */
    async write(input, options) {
        const systemMessage = this.buildSystemMessage(input, options);
        const userMessage = this.buildUserMessage(input);
        const messages = [systemMessage, userMessage];
        const result = await this.client.chat(messages, options?.llmOptions);
        return result.content.trim();
    }
    /**
     * Build the system message for this prompt writing call.
     * 构造本次 Prompt 生成调用所使用的 system 消息。
     */
    buildSystemMessage(_input, options) {
        const override = options?.systemPromptOverride;
        if (override && override.trim()) {
            return {
                role: "system",
                content: override.trim(),
            };
        }
        const fromTemplate = options?.systemTemplate?.systemPrompt ??
            this.defaultSystemTemplate?.systemPrompt;
        const content = (fromTemplate ?? DEFAULT_SYSTEM_PROMPT).trim();
        return {
            role: "system",
            content,
        };
    }
    /**
     * Extract code language from the structured task note, if present.
     * 从结构化 taskNote 中提取代码语言（若存在）。
     *
     * Expected format:
     *
     * [Code Language]
     * typescript
     *
     * This parser is intentionally simple and robust.
     * 解析逻辑刻意保持简单与健壮。
     */
    extractCodeLanguage(taskNote) {
        if (!taskNote)
            return undefined;
        const match = taskNote.match(/\[Code Language\]\s*([\s\S]*?)(?:\n\[[^\]]+\]|\n*$)/i);
        if (!match)
            return undefined;
        const block = match[1] ?? "";
        const firstLine = block.split(/\r?\n/).map((l) => l.trim())[0];
        if (!firstLine)
            return undefined;
        return firstLine.toLowerCase();
    }
    /**
     * Build the user message explaining everything the Prompt Writer needs
     * to know in order to synthesize the final prompt.
     *
     * 构造 user 消息，将能力元数据 / DSL 结构 / 用户画像 / taskNote 汇总给 Prompt Writer。
     */
    buildUserMessage(input) {
        const { ability, parsedDsl, userProfile, taskNote } = input;
        const codeLanguage = this.extractCodeLanguage(taskNote);
        let languageHint = "";
        if (codeLanguage && ability.languageSpecificHints) {
            const hint = ability.languageSpecificHints[codeLanguage];
            if (hint) {
                languageHint = hint.trim();
            }
        }
        const lines = [];
        // High-level instruction to the prompt writer
        // 给 Prompt Writer 的高层指示
        lines.push("Your job is to craft the best possible single prompt for a downstream LLM, based on the information below.", "你需要根据以下信息，为下游大模型生成一条高质量的单条 Prompt。", // Chinese clarification
        "");
        // Ability section
        lines.push("[Ability]");
        lines.push(`id: ${ability.id}`);
        lines.push(`description: ${ability.description}`);
        if (ability.strategy) {
            lines.push(`strategy: ${ability.strategy}`);
        }
        if (ability.promptHints && ability.promptHints.length > 0) {
            lines.push("");
            lines.push("prompt_hints:");
            for (const hint of ability.promptHints) {
                lines.push(`- ${hint}`);
            }
        }
        // DSL section
        lines.push("");
        lines.push("[DSL]");
        lines.push(`raw: ${parsedDsl.raw}`);
        if (input.parsedDsl.args !== undefined) {
            lines.push(`args: ${input.parsedDsl.args}`);
        }
        // UserProfile section
        lines.push("");
        lines.push("[UserProfile]");
        lines.push(`id: ${userProfile.id}`);
        if (userProfile.displayName) {
            lines.push(`displayName: ${userProfile.displayName}`);
        }
        if (userProfile.role) {
            lines.push(`role: ${userProfile.role}`);
        }
        if (userProfile.locale) {
            lines.push(`locale: ${userProfile.locale}`);
        }
        if (userProfile.timezone) {
            lines.push(`timezone: ${userProfile.timezone}`);
        }
        // Code language & language-specific hints
        lines.push("");
        lines.push("[Context]");
        if (codeLanguage) {
            lines.push(`code_language: ${codeLanguage}`);
        }
        else {
            lines.push("code_language: unknown");
        }
        if (languageHint) {
            lines.push("");
            lines.push("[LanguageSpecificHint]");
            lines.push(languageHint);
        }
        // Task note section
        if (taskNote && taskNote.trim()) {
            lines.push("");
            lines.push("[TaskNote]");
            lines.push(taskNote.trim());
        }
        // Final explicit instruction
        // 最终明确要求
        lines.push("");
        lines.push("Now, based on everything above, write a single final prompt for the downstream LLM.");
        lines.push("Only output the prompt text itself, without explanations, comments, or markdown fences.");
        lines.push("现在请基于以上信息，为下游大模型生成一条完整的 Prompt，只输出 Prompt 本身，不要解释或添加其他内容。");
        const content = lines.join("\n");
        return {
            role: "user",
            content,
        };
    }
}
exports.LLMPromptWriter = LLMPromptWriter;
//# sourceMappingURL=LLMPromptWriter.js.map