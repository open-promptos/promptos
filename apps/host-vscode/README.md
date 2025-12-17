# PromptOS for VS Code

PromptOS is a tiny “OS layer” between you and your LLMs.

Instead of hand-writing long prompts, you type a one-line DSL like:

Bash

`op:code.review.api(strict)`

The PromptOS VS Code extension takes:

- the DSL from the current line or input,
- your selected text / clipboard as context,
- plus your LLM config,

and generates a **ready-to-send prompt** in a new Markdown tab.

---

## 1. Requirements

- VS Code **1.90.0** or later
- Node.js **18+** (only required if you build/run from source)
- An LLM API key (e.g. OpenAI / OpenAI-compatible / Groq) if you use LLM-based strategies

---

## 2. Installation

### 2.1 From VS Code Marketplace (recommended)

1. Open VS Code.
2. Go to **Extensions** (`Ctrl+Shift+X` / `Cmd+Shift+X`).
3. Search for: **`PromptOS`** or **`promptos`**.
4. Install the extension published by **`promptos`**.

Marketplace identifier:

`promptos.promptos-vscode`

---

### 2.2 From a `.vsix` file

If you have a built `.vsix` file (e.g. from CI or local packaging):

1. In VS Code, open the **Extensions** view.
2. Click the `...` menu → **Install from VSIX…**.
3. Select the `promptos-vscode-*.vsix` file.
4. Reload VS Code if prompted.

---

### 2.3 Running from source (development)

Clone the repo:

Bash

`git clone https://github.com/open-promptos/promptos.git cd promptos`

Install dependencies (pnpm is required):

Bash

`pnpm install`

Build the extension:

Bash

`pnpm run build`

Launch VS Code in extension development mode:

1. Open `apps/host-vscode` in VS Code.
2. Press `F5` to start a new **Extension Development Host** window.
3. In that window, the PromptOS extension will be loaded automatically.

---

## 3. Configuration

Open **Settings → Extensions → PromptOS** or use `Ctrl+,` and search for “PromptOS”.

Available settings:

- `promptos.llm.provider`
  - **Default:** `"openai"`
  - LLM provider ID, e.g. `openai`, `openai-compatible`, `groq`.
- `promptos.llm.apiKey`
  - **Default:** `""`
  - API key for your LLM provider.
- `promptos.llm.model`
  - **Default:** `"gpt-4o-mini"`
  - Default LLM model name.
- `promptos.llm.baseUrl`
  - **Default:** `""`
  - Custom base URL for OpenAI-compatible providers (e.g. `https://api.groq.com/openai/v1`).
- `promptos.useClipboardAsFallbackContext`
  - **Default:** `true`
  - If enabled, when there is **no selected text**, the extension will try to use the clipboard as fallback context.

You can also configure LLM settings via:

- Workspace file: `.promptos/config.json` at your project root.
- Environment variables (`LLM_PROVIDER`, `LLM_API_KEY`, etc.) used as a final fallback.

---

## 4. Commands & Keybindings

The extension contributes two main commands:

### 4.1 `PromptOS: Generate Prompt from DSL`

- **Command ID:** `promptos.generatePromptFromDsl`
- **Default keybinding:** `Ctrl+Alt+P` (when `editorTextFocus`)

**Workflow (Raycast-like):**

1. **Select** the code/text you want to use as context (recommended).
2. Trigger the command (`Ctrl+Alt+P`).
3. A **QuickPick menu** appears listing all available abilities (e.g. `code.review.api`, `code.explain`).
   - You can fuzzy search here.
4. After selecting an ability, an **Input Box** appears asking for **Arguments**.
   - Example: type `strict` or `line-by-line`.
   - Leave empty for defaults.
5. PromptOS will:
   - Compile the prompt using the selected ability and arguments.
   - Detect language and include context.
   - Open a **new Markdown tab** with the generated prompt.

---

### 4.2 `PromptOS: Run DSL from Current Line`

- **Command ID:** `promptos.runDslFromCurrentLine`
- **Default keybinding:** `Ctrl+Alt+O` (when `editorTextFocus`)

This command uses **inline DSL with an `op:` prefix**.

**Workflow:**

1. In your editor, write a DSL command on a line, prefixed with `op:`:Bash

   `op:code.review.api(strict)`

2. Optionally select some code/text in the editor (used as context).
3. Trigger the command (`Ctrl+Alt+O`).
4. The extension will:
   - Read the **current line**.
   - Check for the `op:` prefix.
   - Parse the DSL (e.g. ID=`code.review.api`, Args=`strict`).
   - Collect context (Selection + Language).
   - Generate and open the prompt.

---

## 5. DSL Basics

PromptOS uses a **Flexible Dot-Notation DSL**:

Bash

`op:ability.id(arguments)`

- `op:`: Host prefix (required for line-level commands).
- `ability.id`: The unique identifier of the ability in the registry.
- `(arguments)`: Optional parameters passed to the ability.

**Examples:**

Bash

`op:code.review.api(strict) op:write.tech.spec(blog, concise) op:code.explain(line-by-line)`

> Note:
> Large text (code, docs) is passed via Selection, not inside the DSL arguments.

---

## 6. Example Workflows

### 6.1 API Code Review

1. Open a TypeScript file `my-api.ts`.
2. Select the API handler code.
3. On a new line, type:Bash

   `op:code.review.api(strict)`

4. Press `Ctrl+Alt+O`.
5. A new tab opens with a rigorous API review prompt ready for your LLM.

---

### 6.2 Writing a Technical Spec

1. Select your rough notes or feature requirements.
2. Press `Ctrl+Alt+P` (Generate Prompt from DSL).
3. Select **`write.tech.spec`**.
4. Enter arguments: `concise, blog`.
5. Get a structured prompt to generate a technical blog post from your notes.

---

### 6.3 Explain Complex Code

1. Select a complex Regular Expression or algorithm.
2. Type:Bash

   `op:code.explain(line-by-line)`

3. Press `Ctrl+Alt+O`.
4. Get a prompt that instructs the LLM to break down the code logic line by line.

---

## 7. Troubleshooting

- **“Current line does not contain PromptOS DSL (missing `op:` prefix)”**
  - Ensure your line starts with `op:`. Example: `op:code.explain`.
- **Prompts do not mention my selected code**
  - Ensure you have active text selected.
  - If no text is selected, check if `promptos.useClipboardAsFallbackContext` is enabled.
- **LLM calls fail (if using LLM strategy)**
  - Check your API Key in settings.
  - Verify your `baseUrl` if using a custom provider.

---

## 8. Feedback & Contributions

- Source code: `https://github.com/open-promptos/promptos`
- Issues: `https://github.com/open-promptos/promptos/issues`

Pull requests are welcome! PromptOS is currently in **v0.1.0 MVP**.
