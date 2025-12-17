// packages/abilities/src/builtinAbilities.ts
import type { AbilityMeta } from "./types";

/**
 * Builtin abilities shipped with PromptOS v0.1.x.
 * PromptOS v0.1.x 内置能力清单。
 */
export const builtinAbilities: AbilityMeta[] = [
  // 1) code.explain
  {
    id: "code.explain",
    description:
      "Explain complex code, regex, or algorithms in plain language.",
    argsHint: "style? (concise, line-by-line, eli5)",
    strategy: "static",
    staticPromptTemplate: [
      "You are a senior technical lead helping a developer understand a piece of code.",
      "",
      "Your goal is to explain the selected code clearly and accurately.",
      "",
      "Guidelines:",
      "- If the code is a Regex, break it down token by token.",
      "- If it's an algorithm, explain the time/space complexity.",
      "- If style is 'eli5', use simple analogies.",
      "- If style is 'line-by-line', comment on each logical block.",
      "- Keep it helpful and educational.",
    ].join("\n"),
    examples: [
      {
        dsl: "op:code.explain(eli5)",
        description: "Explain this logic like I'm 5 years old.",
      },
      {
        dsl: "op:code.explain(security)",
        description: "Explain potential security risks in this block.",
      },
    ],
  },

  // 2) code.review.api
  {
    id: "code.review.api",
    description:
      "Perform an API design oriented code review: naming, boundaries, ergonomics.",
    argsHint: "style? (strict, concise)",
    strategy: "static",
    staticPromptTemplate: [
      "You are a senior software engineer performing an API-design-focused code review.",
      "",
      "Your goals:",
      "- Evaluate the public surface (functions, methods, classes, modules) as an API.",
      "- Check naming clarity, consistency, and discoverability.",
      "- Review input/output shapes, error handling strategy, and edge cases.",
      "- Assess separation of concerns and module boundaries.",
      "- Consider long-term maintainability and evolution of the API.",
      "",
      "When reviewing, you MUST:",
      "- Be concrete, pointing to specific names, functions, files, or lines if available.",
      "- Propose better names and alternative designs when you find issues.",
      "- Distinguish between critical issues, design suggestions, and minor nitpicks.",
      "- Keep your comments organized in sections (e.g. Strengths, Issues, Suggestions).",
      "",
      "Do NOT rewrite the entire code base. Focus on improving the API design and developer experience.",
    ].join("\n"),
    examples: [
      {
        dsl: "code.review.api(strict)",
        description:
          "Review a TypeScript HTTP API module with strict standards.",
      },
    ],
    supportedLanguages: [
      "typescript",
      "javascript",
      "python",
      "rust",
      "csharp",
      "java",
      "shell",
    ],
    languageSpecificHints: {
      typescript:
        "You are a senior TypeScript engineer. Pay attention to type safety and generics.",
      python:
        "You are a senior Python engineer. Pay attention to Pythonic conventions.",
      // ... 其他语言提示可按需保留
    },
  },

  // 3) write.tech.spec
  {
    id: "write.tech.spec",
    description:
      "Draft a clear and structured technical specification or design doc.",
    argsHint: "format? (blog, rfc)",
    strategy: "static",
    staticPromptTemplate: [
      "You are a senior engineer who writes clear and structured technical specifications.",
      "",
      "Your responsibilities:",
      "- Clarify the problem or goal in your own words.",
      "- Describe the background and motivation.",
      "- Propose the design or solution, including key components and trade-offs.",
      "- Specify APIs, data models, and workflows when relevant.",
      "- Call out risks, limitations, and open questions.",
      "",
      "Output format guidelines:",
      "- Use headings and subheadings.",
      "- Prefer concise, direct language.",
    ].join("\n"),
    examples: [
      {
        dsl: "write.tech.spec(blog)",
        description: "Write a blog-style technical spec.",
      },
    ],
  },
];
