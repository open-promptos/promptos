# Open-PromptOS Story

### 1. Background: Life Before PromptOS

Modern developers live between two worlds:

- On one side: **people** with messy, evolving intents
  (“Help me review this API”, “Draft a spec for this feature”, “Design a 1-year CS learning plan”).
- On the other side: **LLMs and agent runtimes**
  (OpenAI, Groq, local models, MCP-based tools, etc.).

Today, the bridge between these two worlds is… ad-hoc prompts:

- You copy some code / text
- You open an LLM client
- You type a long, handcrafted prompt
- You paste context
- You tweak wording and structure manually
- You repeat this every single day, slightly differently each time

Every team re-invents their own internal “prompt cookbook” in Notion, Google Docs, or random snippets, and every person remembers a slightly different version of “how we ask the model to do X”.

It works, but it doesn’t scale. It’s noisy, inconsistent, and hard to share, version, or evolve.

---

### 2. What is PromptOS?

**PromptOS is a tiny “OS layer” between humans and large models / agent runtimes.**

Instead of writing long free-form prompts, the user only needs to write one line of DSL:

Bash

`op:ability.id(arguments)`

Examples:

Bash

`op:code.review.api(strict) op:write.tech.spec(blog, concise) op:code.explain(line-by-line)`

PromptOS takes this line of DSL + contextual inputs (selected code, clipboard, extra notes) + user profile, and **compiles it into a high-quality prompt**. That prompt can then be used with any LLM or Agent client.

**Key positioning:**

- PromptOS is about the **Prompt compilation / generation layer**
  – not about agent orchestration, not about tool execution.
- Think of it as a **Prompt Compiler + Prompt Cookbook + DSL**,
  not a monolithic AI framework.

---

### 3. Why a DSL?

The core idea: **your workflow should be structured, your prompt shouldn’t.**

The DSL describes **what** you want to do and a few essential parameters, not the entire context.

**Flexible Dot-Notation Syntax:**

Bash

`op:ability.id(arguments)`

- `op:`
  Host-specific prefix (e.g. in VSCode) to distinguish DSL lines from normal text.
- `ability.id`
  A dot-separated identifier found in the **Flat Registry** (e.g., `code.review.api`, `translate`, `agent.run`).
- `(arguments)`
  Optional parameters passed to the ability (e.g. `strict`, `zh-CN`).
  The parser greedily matches the string before the last parenthesis as the ID.

The parsed result is simple:

- `raw` – original DSL string
- `abilityId` – e.g. `code.review.api`
- `args` – e.g. `strict`

**Important principle:**

> DSL only describes the task and lightweight parameters.
>
> Large text (selected code, docs, notes) is **not** inside the DSL.
>
> It is provided separately by the host (VSCode / CLI) via `selectedText`, `taskNote`, etc.

This keeps the DSL:

- Short and easy to type
- Stable and versionable
- Safe to share and reuse (no accidental leakage of sensitive content)

---

### 4. The Vision: From Cookbook to Cloud OS

We plan PromptOS in three incremental versions:

### v0.1.0 – Offline Prompt Cookbook (MVP)

Goal: **Work completely offline and still be useful.**

- A DSL parser (`dsl-core`) using the flexible dot-notation.
- A **Flat Registry** of **built-in abilities** (`AbilityMeta`) and **local static templates**.
- No LLM required for the Prompt Writer:
  - DSL + templates + selected text → final prompt (Markdown).

Core abilities to ship:

- `code.explain` — Instant code explanation & debugging helper.
- `code.review.api` — API-design-centric code review.
- `write.tech.spec` — technical spec / technical writing.

Each ability:

- Has a unique `id` (e.g. `code.review.api`).
- Has a `strategy = "static"` and a `staticPromptTemplate`.
- Can be exported/imported as JSON (simple cookbook-style sharing).
- Is accessible through a VSCode extension:
  - **QuickPick** UI for easy searching.
  - Line-level DSL with `op:` prefix.
  - Uses selected text as context.
  - Outputs the compiled prompt as Markdown.

### v0.1.1 – LLM Prompt Writer Integration

Goal: **Let an LLM co-author the prompt itself.**

On top of v0.1.0:

- Add `llm-core` and `LLMPromptWriter`.
- Introduce `LLMClient` abstraction + providers + `createLLMClient` factory.
- Support:
  - `openai`
  - `openai-compatible` (e.g. Groq via `baseUrl`).
- For each ability, add:

TypeScript

`strategy: "static" | "llm";`

- `strategy = "static"` → use local template as before.
- `strategy = "llm"` → call `LLMPromptWriter` to generate a high-quality prompt, based on:
  - Ability meta
  - Parsed DSL (`abilityId` + `args`)
  - User profile
  - Structured task note (selected text, clipboard, language, etc.)

We also introduce **multi-language support** for abilities like `code.review.api`:

- `supportedLanguages` (e.g. `["typescript", "python", "rust", "csharp", "java", "shell"]`).
- `languageSpecificHints` per language.
- Prompt Writer merges the language-specific hints automatically.

### v0.1.2 – Cloud Sync, RAG & MCP Design

Goal: **Share, search, and integrate abilities at scale.**

- Use Supabase to store:
  - User profiles
  - User-defined abilities
- Use pgvector for simple RAG:
  - Command completion:
    - Partial DSL or natural language → search abilities.
  - Ability recommendation:
    - Natural language need → recommended `abilityId`s.
- MCP design:
  - PromptOS backend exposes user-defined abilities + RAG results as MCP tools.
  - Clients access them over MCP.

At this stage, PromptOS becomes:

- A **personal / team Prompt OS** with:
  - structured abilities
  - shared prompt knowledge
  - semantic search & recommendation
  - MCP integration hooks

---

### 5. Monorepo Architecture

PromptOS is built as an **npm workspaces + TurboRepo** monorepo:

- `packages/dsl-core` — DSL parser (Flexible Dot-Notation).
- `packages/abilities` — Ability Registry (Flat list).
- `packages/llm-core` — LLMClient abstraction & providers (v0.1.1).
- `packages/prompt-writer` — Prompt Writer agent wrapper.
- `packages/sdk` — unified SDK for hosts (VSCode / CLI etc.).
- `apps/host-vscode` — VSCode extension.
- `examples/` — typical usage scenarios.
- `docs/backend.md` — Supabase / RAG / MCP design (v0.1.2).

This layout makes it easy to:

- Reuse the core logic across hosts (VSCode, CLI, other editors).
- Keep DSL, abilities, and LLM integration decoupled.
- Add new providers or hosts without touching core packages.

---

### 6. Configuration & Secrets

Two environments need special care: **pure Node/CLI** and **VSCode**.

### Node / CLI / Examples

- Use `.env + process.env` with `dotenv`.
- `packages/llm-core` exposes `configFromEnv()`.

### VSCode Extension

LLM config resolution priority:

1. VSCode settings (`promptos.llm.*`)
2. Workspace config: `.promptos/config.json`
3. Environment variables via `configFromEnv()`

The VSCode side implements `resolveLLMConfigForVSCode()` to combine these and build a final `LLMConfig`.

---

### 7. Host Responsibilities: Context, Not DSL

The DSL stays clean. The **host** is responsible for feeding real content.

TypeScript

`export interface GeneratePromptArgs { dsl: string; selectedText?: string; // VSCode selection userProfile: UserProfile; taskNote?: string; // extra notes from the host }`

The host (especially VSCode) will:

- For “Generate Prompt from DSL”:
  - Read selected text as `selectedText`.
- For “Run DSL from Current Line”:
  - Read current line DSL (`op:` prefix).
  - Use selection + clipboard the same way.

Inside the SDK, we build a **structured `taskNote`** (Code Language, Selected Text, Clipboard, Additional Note) passed into the Prompt Writer.

---

### 8. VSCode UX: "Raycast-like" Interaction

In VSCode (`apps/host-vscode`), PromptOS offers a modern, fast interaction model:

1. **PromptOS: Generate Prompt from DSL** (`Ctrl+Alt+P`)
   - **QuickPick Ability Search**: Opens a fuzzy-searchable list of all registered abilities (e.g., `code.review.api`, `code.explain`).
   - **Arguments Input**: After selecting an ability, prompts for optional arguments (e.g., `strict`).
   - **Execution**: Compiles the prompt using the selected ability, arguments, and current editor context.
2. **PromptOS: Run DSL from Current Line** (`Ctrl+Alt+O`)
   - **Line-level Power**: Reads the current line starting with `op:`.
   - **Example**: `op:code.review.api(strict)`.
   - **Seamless**: Instantly generates the prompt in a new tab without additional dialogs.

Host-side service (`promptosService.ts`) encapsulates logic to keep `extension.ts` thin.

---

### 9. Examples & Documentation

`examples/` will showcase three primary workflows:

- `code.explain` — Explain complex code, regex, or algorithms.
- `code.review.api` — API-focused code review.
- `write.tech.spec` — Technical spec / design / blog writing.

Each example directory includes:

- A small TypeScript script using `@promptos/sdk.generatePrompt`.
- A short README demonstrating the DSL usage.

---

### 10. What PromptOS Becomes

When v0.1.x is complete, PromptOS will be:

- A **language-agnostic DSL** (`ability.id(args)`) to describe tasks.
- A **Flat Ability Registry** that teams can extend easily.
- A **Prompt Compiler** that works offline or co-authors with LLMs.
- A **host-agnostic SDK** usable from VSCode, CLI, or other tools.
- A **future-ready backend design** (RAG, Cloud Sync, MCP).

And for daily users, it boils down to something simple:

> Instead of re-writing prompts from scratch,
>
> you hit a shortcut, pick an ability like `code.review.api`,
>
> and let PromptOS handle the rest.
