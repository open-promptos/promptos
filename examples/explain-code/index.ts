import { generatePrompt } from "@promptos/sdk";

// 模拟一段复杂的代码（例如一个复杂的正则）
const complexCode = `const re = /^(([^<>()[\\]\\\\.,;:\\s@"]+(\\.[^<>()[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$/;`;

async function main() {
  console.log("Input Code:\n", complexCode);

  const result = await generatePrompt({
    // DSL: 解释这段代码，风格为 line-by-line
    dsl: "code.explain(line-by-line)",
    selectedText: complexCode,
    userProfile: { id: "user-1", preferences: { locale: "zh-CN" } },
  });

  console.log("\n--- Generated Prompt ---\n");
  console.log(result.prompt);
}

main().catch(console.error);
