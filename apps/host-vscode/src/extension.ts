// apps/host-vscode/src/extension.ts
import * as vscode from "vscode";
import {
  handleGeneratePromptFromDsl,
  handleRunDslFromCurrentLine,
} from "./promptosService";

/**
 * Extension entry point.
 * VSCode 扩展入口。
 */
export function activate(context: vscode.ExtensionContext) {
  // Register "Generate Prompt from DSL" command
  // 注册 “Generate Prompt from DSL” 命令
  const generatePromptCmd = vscode.commands.registerCommand(
    "promptos.generatePromptFromDsl",
    async () => {
      try {
        await handleGeneratePromptFromDsl(context);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        void vscode.window.showErrorMessage(
          `PromptOS generatePromptFromDsl failed: ${message}`,
        );
      }
    },
  );

  // Register "Run DSL from Current Line" command
  // 注册 “Run DSL from Current Line” 命令
  const runDslFromLineCmd = vscode.commands.registerCommand(
    "promptos.runDslFromCurrentLine",
    async () => {
      try {
        await handleRunDslFromCurrentLine(context);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        void vscode.window.showErrorMessage(
          `PromptOS runDslFromCurrentLine failed: ${message}`,
        );
      }
    },
  );

  context.subscriptions.push(generatePromptCmd, runDslFromLineCmd);
}

/**
 * Called when the extension is deactivated.
 * 扩展被禁用时调用（此处无需清理资源）。
 */
export function deactivate() {
  // no-op
}
