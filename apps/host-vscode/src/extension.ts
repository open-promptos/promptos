// apps/host-vscode/src/extension.ts
import * as vscode from "vscode";
import {
  handleGeneratePromptFromDsl,
  handleRunDslFromCurrentLine,
  handleExportAsSkill, // 导入新函数
} from "./promptosService";
// 引入 SDK 和 Core 的新功能
import { compileIntentToPos, saveToHistory } from "@promptos/sdk";
import { loadConfig } from "@promptos/llm-core";

/**
 * Extension entry point.
 * VSCode 扩展入口。
 */
export function activate(context: vscode.ExtensionContext) {
  // 1. Register "Generate Prompt from DSL" command
  // 注册 “Generate Prompt from DSL” 命令 (保持原有功能)
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

  // 2. Register "Run DSL from Current Line" command
  // 注册 “Run DSL from Current Line” 命令 (保持原有功能)
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

  // 3. Register "Refine Prompt (Compiler)" command
  // 注册新的 “Refine Prompt” (意图编译) 命令
  const refinePromptCmd = vscode.commands.registerCommand(
    "promptos.refinePrompt",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        void vscode.window.showWarningMessage(
          "PromptOS: No active editor found.",
        );
        return;
      }

      const selection = editor.selection;
      let text = editor.document.getText(selection);

      // If no selection, grab the current line
      // 如果没有选中文本，则自动获取当前光标所在的行
      if (!text) {
        text = editor.document.lineAt(selection.active.line).text;
      }

      if (!text.trim()) {
        void vscode.window.showWarningMessage(
          "PromptOS: Please select some text or intent to refine.",
        );
        return;
      }

      // Show "Compiling..." in status bar
      // 在状态栏显示正在编译，提升用户体验
      const statusBarMsg = vscode.window.setStatusBarMessage(
        "PromptOS: Compiling intent via LLM...",
      );

      try {
        // A. Load Configuration (Env or ~/.promptos/config.json)
        // 加载配置。如果未配置 Key，此处会抛出友好的错误。
        const config = loadConfig();

        // B. Compile Intent -> .pos YAML
        // 调用 SDK 进行编译
        const compiledYaml = await compileIntentToPos(text, config);

        // C. Replace content in Editor
        // 将编辑器中的选中文本替换为生成好的 YAML
        await editor.edit((editBuilder) => {
          if (editor.selection.isEmpty) {
            // If implicit line selection, replace the whole line
            // 如果是隐式选择当前行，替换整行内容
            const lineRange = editor.document.lineAt(selection.active.line)
              .range;
            editBuilder.replace(lineRange, compiledYaml);
          } else {
            editBuilder.replace(selection, compiledYaml);
          }
        });

        void vscode.window.showInformationMessage(
          "PromptOS: Intent compiled successfully!",
        );

        // D. Save to History (Background Task)
        // 后台保存历史记录到 .promptos/history，不阻塞主流程
        if (
          vscode.workspace.workspaceFolders &&
          vscode.workspace.workspaceFolders.length > 0
        ) {
          const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

          saveToHistory(rootPath, {
            intent: text,
            compiledPos: compiledYaml,
            timestamp: Date.now(),
            model: config.model || "unknown",
          })
            .then((path) => {
              console.log(`[PromptOS] History saved: ${path}`);
            })
            .catch((err) => {
              console.warn(`[PromptOS] Failed to save history: ${err}`);
            });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        // Handle missing API Key specifically to guide the user
        // 专门处理缺少 API Key 的情况，引导用户去配置
        if (message.includes("Missing API Key")) {
          const selection = await vscode.window.showErrorMessage(
            `PromptOS: LLM Configuration missing.`,
            "Open Config File",
            "Cancel",
          );
          // Future: Implement "Open Config File" logic to open ~/.promptos/config.json
        } else {
          void vscode.window.showErrorMessage(
            `PromptOS Compiler failed: ${message}`,
          );
        }
      } finally {
        statusBarMsg.dispose();
      }
    },
  );

  // Push all commands to subscriptions
  context.subscriptions.push(
    generatePromptCmd,
    runDslFromLineCmd,
    refinePromptCmd,
  );

  // 注册导出命令
  context.subscriptions.push(
    vscode.commands.registerCommand("promptos.exportAsSkill", async () => {
      try {
        await handleExportAsSkill(context);
      } catch (err) {
        vscode.window.showErrorMessage(`Export failed: ${err}`);
      }
    }),
  );
}

/**
 * Called when the extension is deactivated.
 * 扩展被禁用时调用。
 */
export function deactivate() {
  // no-op
}
