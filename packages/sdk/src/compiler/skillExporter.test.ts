import { describe, it, expect } from "vitest";
import { SkillExporter } from "./skillExporter";

describe("SkillExporter", () => {
  it("should generate valid SKILL.md with YAML frontmatter", () => {
    const mockPkg = {
      meta: { name: "test-skill", description: "Testing logic" },
      instructions: "Do something smart.",
    };

    const output = SkillExporter.compileToMarkdown(mockPkg);

    expect(output).toContain("---");
    expect(output).toContain("name: test-skill");
    expect(output).toContain("# Instructions");
    expect(output).toContain("Do something smart.");
  });

  it("should compress instructions effectively", () => {
    const raw = "请你作为一个... \n\n\n 检查代码。";
    const compressed = SkillExporter.compressInstructions(raw);
    // 验证是否压缩了多余换行和特定引导词
    expect(compressed).not.toContain("\n\n\n");
    expect(compressed).toContain("Role:");
  });
});
