# PromptOS Cookbook

> A practical guide to using, developing, and testing PromptOS.

## 1. What is PromptOS?

PromptOS is a thin “OS layer” that sits **between humans and LLMs / Agent runtimes**.

Instead of handcrafting long prompts, you write a one-line DSL:

Bash

`op:code.explain(line-by-line)`

PromptOS then:

1. Parses this DSL;
2. Combines it with your **selected text / clipboard / extra notes**;
3. Uses **local templates** or an **LLM-based prompt writer**;
4. Outputs a **high-quality prompt string** for you to send to any LLM client.

PromptOS focuses on the **Prompt Compiler / Prompt Cookbook** layer, _not_ on agent orchestration or tool execution.

---

## 2. The DSL in 5 Minutes

### 2.1 DSL Shape: Flexible Dot-Notation

The syntax is extremely simple:

Bash

`ability.id(arguments)`

- **`ability.id`**: The unique ID of the ability found in the registry.
  - Examples: `code.explain`, `code.review.api`, `write.tech.spec`.
- **`(arguments)`**: Optional parameters passed to the ability.
  - Examples: `(strict)`, `(zh-CN)`, `(line-by-line)`.

### 2.2 Parsing Logic

The parser **greedily** matches everything before the last pair of parentheses as the ID.

| **Input**                        | **Parsed ID**     | **Parsed Args** |
| -------------------------------- | ----------------- | --------------- |
| `translate(zh)`                  | `translate`       | `zh`            |
| `code.explain`                   | `code.explain`    | `undefined`     |
| `write.tech.spec(blog, concise)` | `write.tech.spec` | `blog, concise` |

> Note: The op: prefix is a VSCode/Host convention to detect DSL lines, not part of the grammar itself.

---

## 3. Core Concepts

### 3.1 Abilities (Flat Registry)

An **ability** is a named “prompt recipe” stored in a flat registry. It is identified simply by its `id`.

For example:

- `code.explain`
- `code.review.api`
- `write.tech.spec`

Each ability is described by an `AbilityMeta` object:

- `id`: The primary key (e.g. "code.explain").
- `description`: Human-readable summary.
- `argsHint`: Hint string for UI inputs (e.g. "style? (strict, concise)").
- `strategy`: `"static"` or `"llm"`.
- `staticPromptTemplate`: The raw template for static generation.

### 3.2 Prompt Writer

`@promptos/prompt-writer` provides `LLMPromptWriter`, which:

1. Builds a **system message** (template or override).
2. Builds a **user message** containing:
   - Ability meta;
   - Parsed DSL (`abilityId` + `args`);
   - User profile;
   - `taskNote` (language, selected text, clipboard, additional notes).
3. Calls an `LLMClient` to get the **final prompt text**.

---

## 4. Monorepo Architecture

PromptOS uses a **pnpm workspaces + TurboRepo** monorepo:

Plaintext

```shell
.
├─ apps/
│  └─ host-vscode/         # VSCode extension
├─ packages/
│  ├─ dsl-core/            # DSL parser
│  ├─ abilities/           # Ability Registry
│  ├─ llm-core/            # LLM client abstraction
│  ├─ prompt-writer/       # Prompt Writer
│  └─ sdk/                 # Unified SDK for hosts
├─ examples/               # Typical use cases
├─ docs/                   # Architecture & Specs
├─ package.json            # root (workspaces + scripts)
├─ turbo.json              # Turbo pipeline
└─ tsconfig.base.json      # shared TS config
```

- Node ≥ 18.
- Package manager: **pnpm** (Required).

---

## 5. Getting Started (Repo & Tooling)

### 5.1 Clone and Install

Bash

`git clone <your-repo-url> promptos
cd promptos

# Install all workspace dependencies

pnpm install`

### 5.2 Turbo Tasks

Bash

`# Build all packages and apps
pnpm run build

# Run tests across the monorepo

pnpm run test

# Lint

pnpm run lint`

---

## 6. Using the DSL via the SDK (Node / CLI)

The main entry for programs is `@promptos/sdk`.

### 6.1 Basic API

TypeScript

`import { generatePrompt } from "@promptos/sdk";

const result = await generatePrompt({
dsl: "code.explain(line-by-line)",
selectedText: "const regex = /^...\$/;",
userProfile: {
id: "user-123",
name: "Alice",
},
taskNote: "Make it simple.",
});

console.log(result.prompt);`

### 6.2 Context Handling (`taskNote` Layout)

The SDK combines host inputs into a structured `taskNote`:

Plaintext

`[Code Language]
typescript

[Selected Text]
<code or text from the editor>

[Clipboard]
<optional, only if host chooses to use clipboard as fallback>

[Additional Note]
<passed-through taskNote>`

---

## 7. Using PromptOS in VSCode

PromptOS provides a VSCode extension (`apps/host-vscode`) that offers two ways to interact.

### 7.1 Interaction: Raycast-like QuickPick

- **Command**: `PromptOS: Generate Prompt from DSL` (`Ctrl+Alt+P`)
- **Flow**:
  1. User invokes command.
  2. **QuickPick** shows list of abilities (e.g. `code.explain`, `write.tech.spec`).
  3. User selects one.
  4. PromptOS asks for optional arguments (e.g. `concise`).
  5. Generates prompt using current selection.

### 7.2 Line-level DSL: `op:`

- **Command**: `PromptOS: Run DSL from Current Line` (`Ctrl+Alt+O`)
- **Behavior**:
  - Reads current line.
  - If starts with `op:` (e.g. `op:code.explain(eli5)`):
    - Strips prefix.
    - Parses DSL.
    - Generates prompt in new tab.

---

## 8. LLM Configuration & Providers

### 8.1 Environment-Based Configuration (Node / CLI)

In `@promptos/llm-core`, `configFromEnv()` reads:

- `LLM_PROVIDER` (default `openai`)
- `LLM_API_KEY`
- `LLM_BASE_URL`
- `LLM_MODEL`

### 8.2 VSCode Configuration Priority

1. **VSCode Settings**: `promptos.llm.*`
2. **Workspace Config**: `.promptos/config.json`
3. **Environment Variables**: `configFromEnv()` fallback.

---

## 9. Built-in Abilities (Cookbook Examples)

PromptOS ships with at least three built-in abilities:

### 9.1 `code.explain`

**Goal:** Explain complex code, regex, or algorithms.

**Example DSL:**

Bash

`op:code.explain(line-by-line) op:code.explain(eli5)`

**Usage:** Select a confusing Regex and run this command to get a token-by-token breakdown.

### 9.2 `code.review.api`

**Goal:** Perform API-design-oriented code review.

**Example DSL:**

Bash

`op:code.review.api(strict) op:code.review.api(security-focus)`

**Multi-language:** Supports `typescript`, `python`, `rust`, etc., with language-specific hints (e.g. Rust ownership).

### 9.3 `write.tech.spec`

**Goal:** Generate technical specs, design docs, or blog posts.

**Example DSL:**

Bash

`op:write.tech.spec(blog, concise) op:write.tech.spec(rfc, zh-CN)`

---

## 10. Development Guide

### 10.1 Adding a New Ability

1. **Define `AbilityMeta`** in `packages/abilities/src/builtinAbilities.ts`:TypeScript

   `export const myNewAbility: AbilityMeta = {
   // Flat ID
   id: "write.arch.review",
   description: "Architecture review for backend system.",
   argsHint: "focus? (security, scalability)",

   strategy: "static",
   staticPromptTemplate: `You are a software architect...`,

   examples: [
   { dsl: "op:write.arch.review(security)", description: "Security review" }
   ]
   };`

2. **Add to `builtinAbilities` array**.
3. **Rebuild**: `pnpm run build`.

### 10.2 Integrating a New Host

To integrate PromptOS into another environment (e.g. CLI, JetBrains):

1. Obtain DSL string, `selectedText`, and `code language`.
2. Call `@promptos/sdk.generatePrompt`.
3. Display the result.

---

## 11. Testing

### 11.1 DSL Parser Tests (`@promptos/dsl-core`)

Use **Vitest** to test the new flexible parser logic:

TypeScript

`import { parseDsl } from "@promptos/dsl-core";

it("parses flexible dot notation", () => {
const parsed = parseDsl("code.explain(eli5)");
expect(parsed.abilityId).toBe("code.explain");
expect(parsed.args).toBe("eli5");
});`

Run tests:

Bash

`pnpm run test --filter=@promptos/dsl-core`

---

## 12. Roadmap Snapshot

- **v0.1.0 – Offline Prompt Cookbook (MVP)**
  - Flexible Dot-Notation DSL.
  - Flat Ability Registry.
  - VSCode QuickPick & Line DSL.
- **v0.1.1 – LLM Prompt Writer**
  - `LLMClient` & `LLMPromptWriter`.
  - Co-authoring prompts with LLMs.
- **v0.1.2 – Cloud Sync & RAG**
  - Supabase backend.
  - Semantic search for abilities.
  - MCP integration.
