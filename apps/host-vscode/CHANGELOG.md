# promptos-vscode

## 0.2.0

### Minor Changes

- 1d69cd8: feat: Release v0.2.0 "Agentic Compiler".

  ✨ **Core Features**:

  - **Intent Compiler**: Implemented `compileIntentToPos` in SDK. Converts natural language intent into structured `.pos` files using Meta-Prompting.
  - **History Manager**: Added auto-save functionality. Compiled prompts are now saved to `.promptos/history/` in Markdown format.

  ⚙️ **Infrastructure**:

  - **Layered Config**: Refactored `llm-core` to support configuration loading priority: Code > Env > `~/.promptos/config.json`.
  - **Security**: API Keys can now be safely stored in local user configuration files.

  🖥️ **VSCode Extension**:

  - **New Command**: Added `promptos.refinePrompt`. Select text and compile it into a prompt agent.
  - **UX Improvements**: Added status bar progress indicators and better error handling for missing configurations.

### Patch Changes

- Updated dependencies [1d69cd8]
  - @promptos/llm-core@0.3.0
  - @promptos/sdk@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies
  - @promptos/llm-core@1.0.0
  - @promptos/sdk@1.0.0
