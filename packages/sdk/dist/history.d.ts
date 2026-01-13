/**
 * Interface defining what we save in the history record.
 * 定义历史记录中保存的数据结构。
 */
export interface HistoryEntry {
    /**
     * The original raw intent from the user.
     * 用户原始的意图文本。
     */
    intent: string;
    /**
     * The compiled .pos (YAML) content.
     * 编译后的 .pos YAML 内容。
     */
    compiledPos: string;
    /**
     * Timestamp of generation (ms).
     * 生成时的时间戳。
     */
    timestamp: number;
    /**
     * The model used for generation (e.g., "gpt-4o").
     * 用于生成的模型名称。
     */
    model: string;
}
/**
 * Saves the compiled prompt to a local history file in Markdown format.
 * 将编译后的 Prompt 保存为本地 Markdown 格式的历史记录文件。
 *
 * @param projectRoot The root path of the current project/workspace.
 * @param entry The history entry data.
 * @returns The full path to the saved file.
 */
export declare function saveToHistory(projectRoot: string, entry: HistoryEntry): Promise<string>;
