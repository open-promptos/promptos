import { SkillExporter, exportToSkillStandard } from "@promptos/sdk";
import * as fs from "fs";
import * as path from "path";

async function runDemo() {
  const mockAbility = {
    id: "code-reviewer",
    description: "A professional React & TypeScript code auditor.",
  };

  const rawPrompt = `请你作为一个资深工程师，检查这段代码的逻辑。
  
  注意：
  1. 检查内存泄漏。
  2. 检查 Tailwind 类名规范。`;

  console.log("🚀 Starting Agentic Compilation...");

  // 调用我们刚才在 SDK 中实现的逻辑
  const skill = await exportToSkillStandard(mockAbility, rawPrompt);

  console.log("✅ Compilation finished.");
  console.log("--- Output Preview ---");
  console.log(skill.content);
  console.log("----------------------");

  // 模拟写入到本地 .agent/skills 目录
  const targetDir = path.join(__dirname, "../", skill.directory);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(path.join(targetDir, skill.filename), skill.content);
  console.log(`📂 Skill exported to: ${targetDir}${skill.filename}`);
}

runDemo().catch(console.error);
