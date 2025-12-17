"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePrompt = generatePrompt;
// packages/sdk/src/generatePrompt.ts
const dsl_core_1 = require("@promptos/dsl-core");
const abilities_1 = require("@promptos/abilities");
const prompt_writer_1 = require("@promptos/prompt-writer");
const llm_core_1 = require("@promptos/llm-core");
/**
 * Build a structured taskNote that merges selectedText and external taskNote.
 * 构造结构化 taskNote，将选中文本与外部说明合并。
 *
 * 约定结构（简化版本）：
 *
 * [Code Language]
 * unknown
 *
 * [Selected Text]
 * ...
 *
 * [Additional Note]
 * ...
 *
 * 说明：
 * - 如果宿主已经自己构造了包含 [Code Language] 等区块的结构化内容，
 *   则建议直接透传到 `args.taskNote`，并在此处检测到后不再重复包装。
 */
function buildStructuredTaskNote(args) {
    const { selectedText, taskNote } = args;
    const hasStructuredHeader = typeof taskNote === "string" && /\[Code Language\]/i.test(taskNote);
    // If host already provided a structured note, just return it.
    // 如果宿主已经提供了结构化 note，则直接使用。
    if (hasStructuredHeader) {
        return taskNote;
    }
    const sections = [];
    // [Code Language] — SDK 这里默认 unknown，具体语言可由宿主预先写入 taskNote。
    sections.push("[Code Language]");
    sections.push("unknown");
    sections.push("");
    // [Selected Text]
    sections.push("[Selected Text]");
    if (selectedText && selectedText.trim()) {
        sections.push(selectedText.trim());
    }
    else {
        sections.push("<none>");
    }
    sections.push("");
    // [Additional Note]
    sections.push("[Additional Note]");
    if (taskNote && taskNote.trim()) {
        sections.push(taskNote.trim());
    }
    else {
        sections.push("<none>");
    }
    return sections.join("\n");
}
/**
 * Build a prompt purely from a static template (strategy = "static").
 * 使用静态模板构建 Prompt（strategy = "static"）。
 */
function buildStaticPrompt(ability, input, structuredTaskNote) {
    const template = (ability.staticPromptTemplate || "").trim();
    const lines = [];
    if (template) {
        lines.push(template);
        lines.push("");
    }
    lines.push("---");
    lines.push("");
    lines.push("[PromptOS Context]");
    lines.push(`ability_id: ${ability.id}`);
    lines.push("");
    lines.push("[DSL]");
    lines.push(`raw: ${input.parsedDsl.raw}`);
    if (input.parsedDsl.args !== undefined) {
        lines.push(`args: ${input.parsedDsl.args}`);
    }
    lines.push("");
    lines.push("[UserProfile]");
    lines.push(`id: ${input.userProfile.id}`);
    if (input.userProfile.displayName) {
        lines.push(`displayName: ${input.userProfile.displayName}`);
    }
    if (input.userProfile.role) {
        lines.push(`role: ${input.userProfile.role}`);
    }
    if (input.userProfile.locale) {
        lines.push(`locale: ${input.userProfile.locale}`);
    }
    if (input.userProfile.timezone) {
        lines.push(`timezone: ${input.userProfile.timezone}`);
    }
    if (structuredTaskNote && structuredTaskNote.trim()) {
        lines.push("");
        lines.push("[TaskNote]");
        lines.push(structuredTaskNote.trim());
    }
    return lines.join("\n");
}
/**
 * Generate a prompt from DSL + selected text + user profile.
 * 根据 DSL + 选中文本 + 用户画像生成 Prompt。
 */
async function generatePrompt(args) {
    const { dsl, selectedText, userProfile, systemPromptOverride } = args;
    // 1) Parse DSL
    const parsedDsl = (0, dsl_core_1.parseDsl)(dsl);
    // 2) Load ability by abilityId
    const ability = await (0, abilities_1.loadAbilityById)(parsedDsl.abilityId);
    if (!ability) {
        throw new Error(`Unknown ability: "${parsedDsl.abilityId}". ` +
            `Please ensure the DSL maps to a builtin or registered ability.`);
    }
    // 3) Build structured taskNote
    const structuredTaskNote = buildStructuredTaskNote(args);
    const promptWriterInput = {
        ability,
        parsedDsl,
        userProfile,
        taskNote: structuredTaskNote,
    };
    // 4) Decide strategy: static vs llm
    const strategy = ability.strategy ?? "static";
    let prompt;
    if (strategy === "static") {
        // Static template mode
        prompt = buildStaticPrompt(ability, promptWriterInput, structuredTaskNote);
    }
    else if (strategy === "llm") {
        const llmConfig = (0, llm_core_1.configFromEnv)();
        const client = (0, llm_core_1.createLLMClient)(llmConfig);
        const writer = new prompt_writer_1.LLMPromptWriter(client);
        prompt = await writer.write(promptWriterInput, {
            systemPromptOverride,
        });
    }
    else {
        throw new Error(`Unsupported ability strategy: ${String(strategy)}`);
    }
    return {
        prompt,
        meta: {
            parsedDsl,
            ability,
            selectedText,
        },
    };
}
//# sourceMappingURL=generatePrompt.js.map