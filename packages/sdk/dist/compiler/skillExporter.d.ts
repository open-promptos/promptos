import type { SkillPackage } from "../types";
export declare class SkillExporter {
    /**
     * 将 PromptOS 的能力编译为标准化的 SKILL.md 格式
     */
    static compileToMarkdown(pkg: SkillPackage): string;
    /**
     * 指令压缩逻辑 (Agentic Compiler 核心)
     * 目标：在不损失语义的前提下，减少 20% - 40% 的 Token 消耗
     */
    static compressInstructions(raw: string): string;
}
