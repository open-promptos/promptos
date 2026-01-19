"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillExporter = void 0;
// packages/sdk/src/compiler/skillExporter.ts
const yaml_1 = require("yaml");
class SkillExporter {
    /**
     * 将 PromptOS 的能力编译为标准化的 SKILL.md 格式
     */
    static compileToMarkdown(pkg) {
        const yamlHeader = (0, yaml_1.stringify)(pkg.meta);
        // 生成符合 2026 Skills Agent 标准的 Markdown
        return [
            "---",
            yamlHeader.trim(),
            "---",
            "",
            "# Instructions",
            "",
            pkg.instructions,
        ].join("\n");
    }
    /**
     * 指令压缩逻辑 (Agentic Compiler 核心)
     * 目标：在不损失语义的前提下，减少 20% - 40% 的 Token 消耗
     */
    static compressInstructions(raw) {
        // 这里未来可以集成更复杂的 NLP 压缩逻辑
        // 0.2.0 MVP 版本：移除多余换行、压缩空白、精简引导词
        return raw
            .replace(/\n{3,}/g, "\n\n") // 压缩过多的换行
            .replace(/请你作为一个.../g, "Role:") // 模式化引导
            .trim();
    }
}
exports.SkillExporter = SkillExporter;
//# sourceMappingURL=skillExporter.js.map