import type { LLMClient, LLMMessage, LLMChatOptions } from "@promptos/llm-core";
import type { PromptWriterInput, PromptWriterSystemTemplate } from "./types";
/**
 * Options for LLMPromptWriter.write().
 * LLMPromptWriter.write() 的可选参数。
 */
export interface PromptWriterWriteOptions {
    /**
     * System template to use for this call.
     * 本次调用所使用的 system 模板。
     */
    systemTemplate?: PromptWriterSystemTemplate;
    /**
     * Raw system prompt override. When provided, this takes the highest priority.
     * 原始 system prompt 覆盖文本，优先级最高。
     */
    systemPromptOverride?: string;
    /**
     * Additional chat options forwarded to the underlying LLMClient.
     * 透传给底层 LLMClient 的额外参数。
     */
    llmOptions?: LLMChatOptions;
}
/**
 * LLMPromptWriter: uses an LLMClient to synthesize prompts.
 * 通过 LLMClient 调用大模型，综合能力元数据与 DSL 生成高质量 Prompt 的封装。
 */
export declare class LLMPromptWriter {
    private readonly client;
    private readonly defaultSystemTemplate?;
    /**
     * @param client Underlying LLM client instance.
     *               底层 LLM 客户端实例。
     * @param defaultSystemTemplate Optional default system template.
     *                              可选默认 system 模板。
     */
    constructor(client: LLMClient, defaultSystemTemplate?: PromptWriterSystemTemplate);
    /**
     * Write a high-quality prompt using the given input.
     * 使用给定输入生成高质量 Prompt。
     *
     * @returns The final prompt text only (no explanations).
     *          返回的字符串仅为最终 Prompt 文本（无解释说明）。
     */
    write(input: PromptWriterInput, options?: PromptWriterWriteOptions): Promise<string>;
    /**
     * Build the system message for this prompt writing call.
     * 构造本次 Prompt 生成调用所使用的 system 消息。
     */
    protected buildSystemMessage(_input: PromptWriterInput, options?: PromptWriterWriteOptions): LLMMessage;
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
    protected extractCodeLanguage(taskNote?: string): string | undefined;
    /**
     * Build the user message explaining everything the Prompt Writer needs
     * to know in order to synthesize the final prompt.
     *
     * 构造 user 消息，将能力元数据 / DSL 结构 / 用户画像 / taskNote 汇总给 Prompt Writer。
     */
    protected buildUserMessage(input: PromptWriterInput): LLMMessage;
}
