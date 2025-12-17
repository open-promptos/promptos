import { generatePrompt } from "@promptos/sdk";

async function main() {
  const result = await generatePrompt({
    dsl: "code(my-api.ts).review.api(strict)",
    selectedText: "export function foo() {}",
    userProfile: {
      id: "user-1",
      displayName: "Clark",
      locale: "zh-CN",
      timezone: "Asia/Shanghai",
      role: "senior engineer",
    },
    taskNote: "请用中文给出评审结论。",
  });

  console.log(result.prompt);
}

main().catch(console.error);
