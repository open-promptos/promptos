# PromptOS Examples

This folder hosts typical end-to-end examples built on top of `@promptos/sdk`.
They demonstrate how to go from:

- DSL + selected text + user profile
- → structured `taskNote` + ability meta
- → final prompt string

---

## Goals

Each example is meant to:

1. Show a realistic use case for a builtin ability.
2. Provide a small TypeScript script that:
   - Calls `@promptos/sdk.generatePrompt`.
   - Prints or saves the resulting prompt.
3. Include a short README explaining the scenario and DSL usage.

---

## Example Directories

### 1. `examples/explain-code/` (New)

**Scenario:**

- Use the `code.explain` ability to quickly understand complex Regex, algorithms, or legacy code.
- **Example DSL:**
  - `op:code.explain(line-by-line)`
  - `op:code.explain(eli5)`

**Contents:**

- `index.ts`: Demonstrates generating an explanation prompt for a complex Email Validation Regex.
- `README.md`: Shows how to turn confusion into clarity with one line.

### 2. `examples/cli-code-review/`

**Scenario:**

- Use the `code.review.api` ability to review API design for different languages via CLI.
- **Example DSL:**
  - `op:code.review.api(strict)`
  - `op:code.review.api(concise, security-focus)`

**Contents:**

- `index.ts`: Reads a code file, detects language, and generates a review prompt.
- `README.md`: Shows how to standardize API reviews in your CI/CLI workflow.

### 3. `examples/write-tech-spec/`

**Scenario:**

- Use the `write.tech.spec` ability to draft technical specs / design docs / blogs.
- **Example DSL:**
  - `op:write.tech.spec(blog, concise)`
  - `op:write.tech.spec(rfc, zh-CN)`

**Contents:**

- `index.ts`: Takes rough notes and scaffolds a full technical specification prompt.
- `README.md`: Compares manual prompting vs. structured PromptOS DSL.

---

## How to Run Examples

From the monorepo root:

Bash

`pnpm install
pnpm run build

## Run specific example (after adding scripts to package.json)

## pnpm run example:explain`

---

### `packages/abilities/src/builtinAbilities.ts`

```tsx
// packages/abilities/src/builtinAbilities.ts
import type { AbilityMeta } from "./types";

/**
 * Builtin abilities shipped with PromptOS v0.1.x.
 * PromptOS v0.1.x 内置能力清单。
 */
export const builtinAbilities: AbilityMeta[] = [
  // 1) code.explain (Replaces learn.cs.masters)
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
        dsl: "op:code.explain(line-by-line)",
        description: "Explain this function line by line.",
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
        dsl: "op:code.review.api(strict)",
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
        dsl: "op:write.tech.spec(blog)",
        description: "Write a blog-style technical spec.",
      },
    ],
  },
];
```
