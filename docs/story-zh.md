# Open-PromptOS Story

### 1. 背景：PromptOS 诞生之前

现代开发者生活在两个世界之间：

- 一边是**人类**，有着模糊、不断变化的需求（“帮我 review 这个 API”、“起草这个功能的 spec”、“设计一个为期一年的 CS 学习计划”）。
- 另一边是**大模型（LLM）和 Agent 运行时**（OpenAI, Groq, 本地模型, MCP 工具等）。

如今，连接这两个世界的桥梁是……**临时拼凑的提示词（Ad-hoc Prompts）**：

- 你复制一段代码或文本
- 你打开一个 LLM 客户端
- 你手敲一段很长的 Prompt
- 你粘贴上下文
- 你手动调整措辞和结构
- 你每天都在重复这个过程，而且每次写的可能都不太一样

每个团队都在 Notion、Google Docs 或各种代码片段里重新发明他们内部的“Prompt 食谱”，每个人脑子里记着的“如何让模型做 X”的版本也各不相同。

这种方式能用，但**不可扩展**。它充满噪音、缺乏一致性，且难以分享、版本化或迭代。

---

### 2. 什么是 PromptOS？

**PromptOS 是位于人类与大模型/Agent 运行时之间的一个微型“操作系统层”。**

用户不需要编写冗长的自由格式 Prompt，只需要写一行 DSL：

Bash

`op:ability.id(arguments)`

例如：

Bash

`op:code.review.api(strict) op:write.tech.spec(blog, concise) op:code.explain(line-by-line)`

PromptOS 接收这行 DSL，结合上下文输入（选中的代码、剪贴板、额外笔记）以及用户画像，将其**编译成一个高质量的 Prompt**。这个 Prompt 随后可以发送给任何 LLM 或 Agent 客户端。

**核心定位：**

- PromptOS 关注的是 **Prompt 编译/生成层** —— 而不是 Agent 编排，也不是工具执行。
- 把它想象成 **Prompt 编译器 + Prompt 食谱 + DSL**，而不是一个庞大的 AI 框架。

---

### 3. 为什么要用 DSL？

核心理念：**你的工作流应该是结构化的，而你的 Prompt 不必是。**

DSL 只描述**你想做什么**以及少量必要的参数，而不是整个上下文。

**灵活点分记法 (Flexible Dot-Notation) 语法：**

Bash

`op:ability.id(arguments)`

- `op:`
  宿主特定的前缀（例如在 VSCode 中），用于将 DSL 行与普通文本区分开。
- `ability.id`
  在 **扁平注册表 (Flat Registry)** 中找到的点分标识符（例如 `code.review.api`, `translate`, `agent.run`）。
- `(arguments)`
  传递给能力的参数（可选，例如 `strict`, `zh-CN`）。
  解析器会贪婪地匹配最后一个括号前的所有字符串作为 ID。

解析结果非常简单：

- `raw` – 原始 DSL 字符串
- `abilityId` – 例如 `code.review.api`
- `args` – 例如 `strict`

**重要原则：**

> DSL 仅描述任务和轻量级参数。
>
> 大段文本（选中的代码、文档、笔记）**不**包含在 DSL 中。
>
> 它们由宿主（VSCode / CLI）通过 `selectedText`, `taskNote` 等方式单独提供。

这使得 DSL：

- 简短且易于输入
- 稳定且可版本化
- 安全易分享（不会意外泄露敏感内容）

---

### 4. 愿景：从食谱到云端 OS

我们计划分三个阶段增量发布 PromptOS：

### v0.1.0 – 离线 Prompt 食谱 (MVP)

目标：**完全离线工作，并且即刻有用。**

- 一个使用灵活点分记法的 DSL 解析器 (`dsl-core`)。
- 一个包含**内置能力** (`AbilityMeta`) 和**本地静态模板**的 **扁平注册表**。
- Prompt Writer 不需要 LLM：
  - DSL + 模板 + 选中文本 → 最终 Prompt (Markdown)。

核心内置能力：

- `code.explain` — 即时代码解释与调试助手。
- `code.review.api` — 以 API 设计为核心的代码审查。
- `write.tech.spec` — 技术规格/技术写作。

每个能力：

- 拥有唯一的 `id` (例如 `code.review.api`)。
- 拥有 `strategy = "static"` 和 `staticPromptTemplate`。
- 可以作为 JSON 导入/导出（简单的食谱式分享）。
- 通过 VSCode 插件访问：
  - **QuickPick** 界面，支持快速搜索。
  - 带有 `op:` 前缀的行级 DSL。
  - 使用选中文本作为上下文。
  - 输出编译好的 Markdown Prompt。

### v0.1.1 – LLM Prompt Writer 集成

目标：**让 LLM 参与 Prompt 的共同创作。**

在 v0.1.0 之上：

- 增加 `llm-core` 和 `LLMPromptWriter`。
- 引入 `LLMClient` 抽象 + 提供商 + `createLLMClient` 工厂。
- 支持：
  - `openai`
  - `openai-compatible` (例如通过 `baseUrl` 支持 Groq)。
- 为每个能力增加策略选项：

TypeScript

`strategy: "static" | "llm";`

- `strategy = "static"` → 像以前一样使用本地模板。
- `strategy = "llm"` → 调用 `LLMPromptWriter` 生成高质量 Prompt，基于：
  - 能力元数据 (Ability Meta)
  - 解析后的 DSL (`abilityId` + `args`)
  - 用户画像
  - 结构化任务笔记（选中文本、剪贴板、语言等）

我们还为 `code.review.api` 等能力引入**多语言支持**：

- `supportedLanguages` (例如 `["typescript", "python", "rust", "csharp", "java", "shell"]`)。
- 每种语言的 `languageSpecificHints`（Rust 的所有权 vs Python 的动态类型）。
- Prompt Writer 会自动合并这些特定语言的提示。

### v0.1.2 – 云同步、RAG 与 MCP 设计

目标：**大规模分享、搜索和集成能力。**

- 使用 Supabase 存储：
  - 用户画像
  - 用户定义的能力
- 使用 pgvector 进行简单的 RAG：
  - 命令补全：部分 DSL 或自然语言 → 搜索能力。
  - 能力推荐：自然语言需求 → 推荐 `abilityId`。
- MCP 设计：
  - PromptOS 后端将用户定义的能力 + RAG 结果作为 MCP 工具暴露。
  - 客户端通过 MCP 协议访问它们。

在这个阶段，PromptOS 变成：

- 一个 **个人/团队的 Prompt OS**，拥有：
  - 结构化的能力
  - 共享的 Prompt 知识
  - 语义搜索与推荐
  - MCP 集成接口

---

### 5. Monorepo 架构

PromptOS 构建在 **npm workspaces + TurboRepo** 单体仓库之上：

- `packages/dsl-core` — DSL 解析器 (Flexible Dot-Notation)。
- `packages/abilities` — 能力注册表 (Flat List)。
- `packages/llm-core` — LLMClient 抽象与提供商 (v0.1.1)。
- `packages/prompt-writer` — Prompt Writer 代理包装器。
- `packages/sdk` — 统一的宿主 SDK (VSCode / CLI 等)。
- `apps/host-vscode` — VSCode 插件。
- `examples/` — 典型使用场景。
- `docs/backend.md` — Supabase / RAG / MCP 设计 (v0.1.2)。

这种布局使得：

- 跨宿主（VSCode, CLI, 其他编辑器）复用核心逻辑变得容易。
- 保持 DSL、能力和 LLM 集成的解耦。
- 无需触碰核心包即可添加新的提供商或宿主。

---

### 6. 配置与机密管理

两个环境需要特别注意：**纯 Node/CLI** 和 **VSCode**。

### Node / CLI / Examples

- 使用 `.env + process.env` 配合 `dotenv`。
- `packages/llm-core` 暴露 `configFromEnv()`。

### VSCode Extension

LLM 配置解析优先级：

1. VSCode 设置 (`promptos.llm.*`)
2. 工作区配置：`.promptos/config.json`
3. 环境变量：通过 `configFromEnv()`

VSCode 端实现 `resolveLLMConfigForVSCode()` 来合并这些配置并构建最终的 `LLMConfig`。

---

### 7. 宿主职责：上下文，而非 DSL

DSL 保持纯净。**宿主**负责投喂真实内容。

TypeScript

`export interface GeneratePromptArgs { dsl: string; selectedText?: string; // VSCode 选区 userProfile: UserProfile; taskNote?: string; // 来自宿主的额外笔记 }`

宿主（特别是 VSCode）将：

- 对于 “Generate Prompt from DSL”：
  - 读取选中文本作为 `selectedText`。
- 对于 “Run DSL from Current Line”：
  - 读取当前行 DSL (`op:` 前缀)。
  - 同样使用选区 + 剪贴板。

在 SDK 内部，我们构建一个**结构化的 `taskNote`**（代码语言、选中文本、剪贴板、额外笔记）传递给 Prompt Writer。

---

### 8. VSCode UX：“Raycast 式”交互

在 VSCode (`apps/host-vscode`) 中，PromptOS 提供了一种现代、快速的交互模式：

1. **PromptOS: Generate Prompt from DSL** (`Ctrl+Alt+P`)
   - **QuickPick 能力搜索**：打开一个模糊搜索列表，列出所有注册的能力（如 `code.review.api`, `code.explain`）。
   - **参数输入**：选中能力后，提示输入可选参数（如 `strict`）。
   - **执行**：使用选中的能力、参数和当前编辑器上下文编译 Prompt。
2. **PromptOS: Run DSL from Current Line** (`Ctrl+Alt+O`)
   - **行级威力**：读取以 `op:` 开头的当前行。
   - **示例**：`op:code.review.api(strict)`。
   - **无缝体验**：即时生成 Prompt 并打开新标签页，无需额外对话框。

宿主侧服务 (`promptosService.ts`) 封装了逻辑，保持 `extension.ts` 轻量化。

---

### 9. 示例与文档

`examples/` 将展示三个主要工作流：

- `code.explain` — 解释复杂代码、正则或算法。
- `code.review.api` — 以 API 为焦点的代码审查。
- `write.tech.spec` — 技术规格/设计/博客写作。

每个示例目录包含：

- 一个使用 `@promptos/sdk.generatePrompt` 的小型 TypeScript 脚本。
- 一个演示 DSL 用法的简短 README。

---

### 10. PromptOS 将成为什么

当 v0.1.x 完成时，PromptOS 将是：

- 一个 **语言无关的 DSL** (`ability.id(args)`) 用于描述任务。
- 一个团队可以轻松扩展的 **扁平能力注册表**。
- 一个既可离线工作、也可与 LLM 共创的 **Prompt 编译器**。
- 一个可用于 VSCode、CLI 或其他工具的 **宿主无关 SDK**。
- 一个 **面向未来的后端设计**（RAG, 云同步, MCP）。

对于日常用户，它归结为一件简单的事：

> 不再从头重写 Prompt，
>
> 你只需按快捷键，选中像 `code.review.api` 这样的能力，
>
> 剩下的交给 PromptOS。
