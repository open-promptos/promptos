# PromptOS (v0.2.0: Agentic Compiler)

- Official npm scope is `@promptos`
- A tiny OS layer between humans and large language models.
- **Intent -> DSL -> High-quality Prompt -> Standardized Agent Skill.**

## 1. What is PromptOS?

PromptOS is an **Agentic Infrastructure Layer** that translates human intent into high-performance, standardized instructions for the AI era.

In v0.2.0, PromptOS has evolved from a simple DSL runner into a **Skill Factory**. It provides a complete pipeline:

- **Drafting**: Use a one-line **DSL** for lightning-fast prompting in your IDE.
- **Compiling**: Use the **Agentic Compiler** to refine messy natural language into structured `.pos` (PromptOS) files.
- **Distributing**: Export your logic as **Standardized Agent Skills** (`.agent/skills/`) compatible with the 2026 industry standards (GitHub Copilot, Claude Code, Cursor).

---

## 2. Key Features (v0.2.0)

### ✨ Agentic Compiler (Magic Refine)

Don't know how to write the perfect prompt? Just type your intent, select it, and run `PromptOS: Refine Prompt`. The compiler uses Meta-Prompting to transform your thoughts into a production-ready instruction set.

### 📦 Standardized Skill Export

One-click export of any PromptOS ability to `.agent/skills/` (or `.github/skills/`).

- Generates compliant `SKILL.md` with YAML frontmatter.
- Automatically handles instruction compression to save context tokens.
- Instantly makes your private prompts discoverable by AI Agents.

### 📜 Automated History & Security

- **History Manager**: Every compiled prompt is automatically versioned and saved to `.promptos/history/`.
- **Layered Config**: Enterprise-grade configuration priority: `In-code > Env > ~/.promptos/config.json`. Keep your API keys safe and out of your source code.

---

## 3. Command DSL Overview

PromptOS still supports the high-speed **Dot-Notation DSL**:

`op:ability.id(arguments)`

| **Input String** | **Parsed ID** | **Target** |
| --- | --- | --- |
| `op:code.review.api(strict)` | `code.review.api` | API Design Audit |
| `op:write.tech.spec(blog)` | `write.tech.spec` | Technical Content |
| `op:refine(intent)` | `refine` | Trigger Compiler |

## 4. Roadmap

### v0.1.0 – Offline Prompt Cookbook ✅

- DSL parser & Flat Ability Registry.
- Static template strategy.
- Basic VSCode integration.

### v0.2.0 – Agentic Compiler ✅ (Current Stable)

- [x]  **SDK Evolution**: Integrated `SkillExporter` and `IntentCompiler`.
- [x]  **Standardization**: Support for `.agent/skills/` distribution.
- [x]  **Layered Config**: Multi-provider LLM support (OpenAI, Groq, etc.).
- [x]  **UX Upgrade**: Status bar indicators & Better error handling.

### v0.3.0 – Multi-Agent & Cloud Sync (Next)

- [ ]  **Headless CLI**: Run PromptOS abilities in CI/CD pipelines.
- [ ]  **Multi-Agent Protocol**: Inter-skill communication standard.
- [ ]  **AI Hub Integration**: Design for cloud-based skill hosting.

**5. Monorepo Structure**

```
promptos/
├─ packages/
│  ├─ dsl-core/      # The Grammar: DSL parsing & state machines.
│  ├─ sdk/           # The Engine: Intent compiler, Skill exporter, History.
│  ├─ llm-core/      # The Connector: Layered config & LLM clients.
│  ├─ abilities/     # The Library: Built-in industry-standard abilities.
│
├─ apps/
│  └─ host-vscode/   # The Workbench: Refine, Run, and Export UI.
│
└─ .agent/skills/    # Self-Bootstrapped Skills (PromptOS's own AI skills).
```

## 6. VSCode Extension Usage

### 6.1 Refine Prompt (New in v0.2.0)

1. Select a rough idea or an existing prompt in your editor.
2. Run `PromptOS: Refine Prompt (Compiler)`.
3. PromptOS will use its internal LLM to "compile" your intent into a structured format.

### 6.2 Export as Skill (New in v0.2.0)

1. Trigger the export command via Command Palette.
2. Select your desired Ability.
3. PromptOS generates a `.agent/skills/` package in your root directory, enabling your AI Agents (like Copilot) to "learn" this specific skill instantly.

---

## 7. Status

**PromptOS v0.2.0** is now active. We are moving from "Managing Prompts" to "Compiling Intelligence."