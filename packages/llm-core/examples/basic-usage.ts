// packages/llm-core/examples/basic-usage.ts
// This file is for demonstration only and is not part of the build output.
// 此文件仅作为使用示例，不会出现在构建产物中。

import { configFromEnv, createLLMClient, LLMMessage } from "../src";

async function main() {
  const config = configFromEnv();
  const client = createLLMClient(config);

  const messages: LLMMessage[] = [
    { role: "system", content: "You are a concise assistant." },
    { role: "user", content: "Say hello from PromptOS." },
  ];

  const result = await client.chat(messages, { temperature: 0.3 });

  // eslint-disable-next-line no-console
  console.log("Model:", result.model);
  // eslint-disable-next-line no-console
  console.log("Content:", result.content);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
