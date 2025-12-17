# PromptOS

> Official npm scope is @promptos
>
> A tiny OS layer between humans and large language models.
>
> Describe **what** you want with a one-line DSL, let PromptOS compile the prompt.
> _(Don't panic. It won't format your drive or blue-screen your PC. It's just a really smart plugin.)_

---

## 1. What is PromptOS?

PromptOS is a small “OS layer” that sits between:

- **Humans** with messy, evolving intents (review this API, write this spec, design a learning plan…)
- **LLMs / Agent runtimes** (OpenAI, Groq, OpenAI-compatible APIs, MCP-based tools, etc.)

Instead of manually crafting long prompts, users write a **compact DSL command** like:

```bash
- op:code.review.api(strict)
- op:write.tech.spec(concise, blog)
- op:code.explain(line-by-line)
```

PromptOS then takes:

- the DSL line,
- contextual inputs (selected text, clipboard, extra notes),
- and user profile,

and **compiles them into a high-quality prompt** that can be sent to any LLM client.

**PromptOS is:**

- A **Prompt Compiler + Prompt Cookbook + DSL**, not a monolithic agent framework.
- Focused on the **prompt generation layer**, not on tool execution or complex agent orchestration.

---

## 2. Command DSL Overview

PromptOS uses a flexible **Dot-Notation DSL** with the following shape:

Bash

`op:ability.id(arguments)`

Where:

- `op:`: Host-specific prefix (used in VSCode/CLI to trigger the parser).
- `ability.id`: A dot-separated identifier for the **ability** (e.g. `code.review.api`).
- `(arguments)` (optional): Parameters passed to the ability (e.g. `strict`, `zh-CN`).

Parsing Rule (Flexible Dot-Notation):

The parser greedily matches the string before the last parenthesis as the AbilityID.

**Examples:**

| **Input String**                    | **Parsed ID**     | **Parsed Args** |
| ----------------------------------- | ----------------- | --------------- |
| `op:translate(zh-CN)`               | `translate`       | `zh-CN`         |
| `op:code.review.api`                | `code.review.api` | `undefined`     |
| `op:write.tech.spec(blog, concise)` | `write.tech.spec` | `blog, concise` |

> Note:
>
> The DSL only describes the task + minimal parameters.
>
> Large content (code, docs, notes) is passed via host context (`selectedText`, `taskNote`, etc.), **not** inside the DSL.

For the full grammar, see **`specs/dsl-v0.1.md`**.

---

## 3. Roadmap (v0.1.0 – v0.1.2)

PromptOS evolves in three stages:

### v0.1.0 – Offline Prompt Cookbook ✅ (MVP target)

- [x] DSL parser (`packages/dsl-core`): New **Flexible Dot-Notation**.
- [x] Built-in abilities (`packages/abilities`): **Flat Registry** structure.
  - `code.explain`
  - `code.review.api`
  - `write.tech.spec`
- [x] Static template strategy:
  - `strategy = "static"`
  - `staticPromptTemplate` for system + user prompt shapes
- [x] Prompt generation **without any LLM dependency**:
  - DSL + templates + selected text → final prompt (Markdown)
- [x] VSCode extension (`apps/host-vscode`):
  - **QuickPick** interaction model (Raycast-like ability search).
  - Line-level DSL with `op:` prefix.
  - Output prompt in a new Markdown tab.

### v0.1.1 – LLM Prompt Writer Integration

- [ ] `packages/llm-core`:
  - `LLMClient` abstraction + provider-based `createLLMClient`
- [ ] `packages/prompt-writer`:
  - `LLMPromptWriter` using LLMs to **co-author** prompts
  - `strategy = "llm"` for abilities that leverage LLM prompt writing
- [ ] Multi-language support helpers.

### v0.1.2 – Cloud Sync, RAG & MCP Design

- [ ] `docs/backend.md` design:
  - Supabase schema for user profiles & custom abilities
  - pgvector-based RAG.
- [ ] MCP integration design:
  - Expose abilities + RAG results as MCP tools.

---

## 4. Monorepo Structure

PromptOS is an **npm workspaces + TurboRepo** monorepo, targeting Node ≥ 18.

```
promptos/
├─ package.json              # npm workspaces root
├─ turbo.json                # Turbo pipeline config
│
├─ packages/
│  ├─ dsl-core/              # DSL parser (Flexible Dot-Notation)
│  ├─ abilities/             # Ability Registry (Flat List)
│  ├─ llm-core/              # LLMClient & providers (from v0.1.1)
│  ├─ prompt-writer/         # Prompt Writer wrapper (from v0.1.1)
│  ├─ sdk/                   # Host-facing SDK (VSCode / CLI)
│
├─ apps/
│  └─ host-vscode/           # VSCode extension (MVP host)
│
├─ examples/                 # Usage examples
└─ docs/                     # Architecture & Specs
```

---

## 5. Core Concepts

### 5.1 Ability & `AbilityMeta`

An ability is a named capability stored in a flat registry.

Each ability is described by an AbilityMeta:

```tsx
export interface AbilityMeta {
  /** Unique identifier (Primary Key), e.g. "code.review.api" */
  id: string;

  description: string;
  argsHint?: string; // e.g. "style? (strict, concise)"

  strategy: "static" | "llm";
  staticPromptTemplate?: string;

  examples?: { dsl: string; description?: string }[];

  // Optional / Legacy compatibility
  supportedLanguages?: string[];
}
```

### 5.2 Prompt Writer

The **Prompt Writer** is responsible for constructing the final **prompt text**.

- **Static Strategy**: Merges `staticPromptTemplate` with inputs.
- **LLM Strategy** (v0.1.1): Calls `LLMPromptWriter` to dynamically generate the prompt using an LLM.

### 5.3 SDK & Hosts

`packages/sdk` aims to provide a single function:

```tsx
export interface GeneratePromptArgs {
  dsl: string; // e.g. "code.review.api(strict)"
  selectedText?: string;
  userProfile: UserProfile;
  taskNote?: string;
}

export function generatePrompt(
  args: GeneratePromptArgs,
): Promise<GeneratePromptResult>;
```

---

## 6. Configuration & Secrets

### 6.1 Node / CLI / examples

For pure Node use (scripts, examples), PromptOS expects environment-based configuration.

packages/llm-core exposes configFromEnv() which reads:

- `LLM_PROVIDER` (default `openai`)
- `LLM_API_KEY` or `OPENAI_API_KEY`
- `LLM_BASE_URL` (default `https://api.openai.com/v1`)
- `LLM_MODEL` (default `gpt-4o-mini`)

### 6.2 VSCode Extension

LLM config resolution priority for VSCode:

1. **VSCode settings**: `promptos.llm.*`
2. **Workspace config file**: `.promptos/config.json`
3. **Environment variables**: via `configFromEnv()` (fallback).

---

## 7. VSCode Extension Usage

The VSCode host lives in `apps/host-vscode`.

### 7.1 Interaction: Raycast-like QuickPick

- **Command**: `PromptOS: Generate Prompt from DSL` (`Ctrl+Alt+P`)
- **Flow**:
  1. Opens a **QuickPick** menu listing all available abilities (fuzzy searchable).
  2. User selects an ability (e.g., `code.review.api`).
  3. User inputs arguments (optional) in an InputBox.
  4. PromptOS generates the prompt and opens it in a new tab.

### 7.2 Line-level DSL: `op:`

- **Command**: `PromptOS: Run DSL from Current Line` (`Ctrl+Alt+O`)
- **Behavior**:
  - Reads current line.
  - If starts with `op:` (e.g., `op:code.review.api(strict)`):
    - Parses DSL.
    - Uses current selection as context.
    - Generates prompt.

---

## 8. Examples

### 8.1 `code.explain`

- **Goal:** Explain complex code, regex, or algorithms.
- **DSL:** `op:code.explain(line-by-line)`

### 8.2 `code.review.api`

- **Goal:** Perform API-design-oriented code review.
- **DSL:** `op:code.review.api(strict)`

### 8.3 `write.tech.spec`

- **Goal:** Generate technical specs or blogs.
- **DSL:** `op:write.tech.spec(blog)`

---

## 9. Backend, RAG & MCP (Design)

The backend design is tracked in `docs/backend.md` (v0.1.2 stage):

- **Supabase tables**:
  - `profiles`: user profiles (preferences, bio, etc.)
  - `abilities`: user-defined abilities with metadata + embeddings
- **pgvector-based RAG**:
  - Natural language intent → recommended `abilityId`s
- **MCP Integration**:
  - PromptOS backend exposes abilities as MCP tools.
  - Clients consume them via MCP.

---

## 10. Development Guide

### 10.1 Prerequisites

- Node.js ≥ 18
- **pnpm** (Required for workspace management)

### 10.2 Basic Commands

From the repo root:

```bash
# Install dependencies
pnpm install

# Build all packages (Topological build via Turbo)
pnpm run build

# Run tests
pnpm test

# Lint
pnpm run lint
```

---

## 11. Documentation & Language Convention

- **Primary Documentation**: English (Root `README.md`, DSL specs, etc.).
- **Optional Translations**: Chinese versions use `.zh.md` suffix (e.g., `README.zh.md`).
- **Code Comments**: Bilingual (English + Chinese) for public APIs and complex logic.

---

## 12. Status

This repository is being implemented in incremental steps.

Currently v0.1.0 MVP is active, featuring the Flexible Dot-Notation DSL and Flat Ability Registry.

---

## 13. Packages & Naming

- GitHub organization: `open-promptos`
- npm organization / scope: `@promptos`

Official npm packages are published under the `@promptos` scope:

- `@promptos/dsl-core`
- `@promptos/abilities`
- `@promptos/llm-core`
- `@promptos/prompt-writer`
- `@promptos/sdk`
