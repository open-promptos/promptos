// apps/host-vscode/src/promptosService.ts
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { generatePrompt } from "@promptos/sdk";
import type { GeneratePromptArgs } from "@promptos/sdk";
import type { LLMConfig } from "@promptos/llm-core";
import { configFromEnv } from "@promptos/llm-core";
import { builtinAbilities } from "@promptos/abilities";

/**
 * Normalize provider id from config into a supported LLMConfig["provider"] value.
 * 将配置中的 provider 字符串规范化为 LLMConfig["provider"] 支持的取值。
 */
function normalizeProviderId(
  raw: string | undefined,
  fallback: LLMConfig["provider"],
): LLMConfig["provider"] {
  if (!raw) return fallback;

  const v = raw.toLowerCase();
  if (
    v === "openai" ||
    v === "openai-compatible" ||
    v === "groq" ||
    v === "grok"
  ) {
    return v;
  }

  // Fallback to env-based provider if value is unsupported.
  // 如果不在当前支持范围内，则退回到 env 配置里的 provider。
  return fallback;
}

/**
 * Map VSCode languageId to internal codeLanguage identifier.
 * 将 VSCode 的 languageId 映射为内部 codeLanguage 标识。
 */
function mapLanguageId(languageId: string): string {
  switch (languageId) {
    case "typescript":
    case "typescriptreact":
      return "typescript";
    case "javascript":
    case "javascriptreact":
      return "javascript";
    case "python":
      return "python";
    case "rust":
      return "rust";
    case "csharp":
    case "c#":
      return "csharp";
    case "java":
      return "java";
    case "shellscript":
    case "bash":
      return "shell";
    default:
      return "unknown";
  }
}

/**
 * Resolve a basic user profile for the current VSCode session.
 * 为当前 VSCode 会话构造一个简单的用户画像。
 */
function resolveUserProfile() {
  const machineId = vscode.env.machineId;
  const displayName = vscode.env.appName || "VSCode User";

  return {
    id: `vscode-${machineId}`,
    displayName,
    locale: vscode.env.language,
    timezone: undefined, // TODO: allow configuration of timezone | 未来允许配置时区
    role: "developer",
    preferences: {},
  };
}

/**
 * Read clipboard text from VSCode environment.
 * 从 VSCode 环境读取剪贴板文本。
 */
async function readClipboardText(): Promise<string> {
  return vscode.env.clipboard.readText();
}

/**
 * Build a structured task note for PromptOS Prompt Writer.
 * 为 PromptOS Prompt Writer 构造结构化 taskNote。
 *
 * 结构示例：
 *
 * [Code Language]
 * typescript
 *
 * [Selected Text]
 * ...
 *
 * [Clipboard]
 * ...
 *
 * [Additional Note]
 * ...
 */
async function buildTaskNoteForVSCode(args: {
  codeLanguage: string;
  selectedText: string | undefined;
  additionalNote?: string;
}): Promise<string> {
  const { codeLanguage, selectedText, additionalNote } = args;

  const config = vscode.workspace.getConfiguration("promptos");
  const useClipboard = config.get<boolean>(
    "useClipboardAsFallbackContext",
    true,
  );

  let clipboardText = "";
  if (useClipboard) {
    clipboardText = (await readClipboardText()).trim();
  }

  const sections: string[] = [];

  sections.push("[Code Language]");
  sections.push(codeLanguage || "unknown");
  sections.push("");

  sections.push("[Selected Text]");
  if (selectedText && selectedText.trim()) {
    sections.push(selectedText.trim());
  } else {
    sections.push("<none>");
  }
  sections.push("");

  sections.push("[Clipboard]");
  if (clipboardText) {
    sections.push(clipboardText);
  } else {
    sections.push("<none>");
  }
  sections.push("");

  sections.push("[Additional Note]");
  if (additionalNote && additionalNote.trim()) {
    sections.push(additionalNote.trim());
  } else {
    sections.push("<none>");
  }

  return sections.join("\n");
}

/**
 * Resolve LLM configuration for VSCode:
 * - VSCode settings
 * - .promptos/config.json
 * - environment variables (configFromEnv)
 *
 * 从 VSCode 环境解析 LLM 配置：
 * - VSCode 设置
 * - 工作区 .promptos/config.json
 * - 环境变量（configFromEnv）
 *
 * 注意：当前 v0.1.0 的内置能力均为 static 策略，
 * 该配置函数主要为后续 LLM 策略预留。
 */
export function resolveLLMConfigForVSCode(): LLMConfig {
  // 1) start with env-based config
  // 1）从环境变量获取基础配置
  const baseConfig = configFromEnv();

  // 2) workspace .promptos/config.json
  // 2）读取工作区 .promptos/config.json
  const workspaceFolders = vscode.workspace.workspaceFolders;
  let fileProvider: string | undefined;
  let fileApiKey: string | undefined;
  let fileModel: string | undefined;
  let fileBaseUrl: string | undefined;

  if (workspaceFolders && workspaceFolders.length > 0) {
    const root = workspaceFolders[0].uri.fsPath;
    const configPath = path.join(root, ".promptos", "config.json");
    if (fs.existsSync(configPath)) {
      try {
        const raw = fs.readFileSync(configPath, "utf8");
        const json = JSON.parse(raw) as {
          llm?: {
            provider?: string;
            apiKey?: string;
            model?: string;
            baseUrl?: string;
          };
        };
        if (json.llm) {
          fileProvider = json.llm.provider;
          fileApiKey = json.llm.apiKey;
          fileModel = json.llm.model;
          fileBaseUrl = json.llm.baseUrl;
        }
      } catch {
        // Ignore parse errors but keep env config.
        // 忽略解析错误，继续使用环境配置。
      }
    }
  }

  // 3) VSCode settings
  // 3）VSCode 设置
  const vscodeConfig = vscode.workspace.getConfiguration("promptos");
  const cfgProvider = vscodeConfig.get<string>("llm.provider");
  const cfgApiKey = vscodeConfig.get<string>("llm.apiKey");
  const cfgModel = vscodeConfig.get<string>("llm.model");
  const cfgBaseUrl = vscodeConfig.get<string>("llm.baseUrl");

  const merged: LLMConfig = {
    ...baseConfig,
    provider: normalizeProviderId(
      cfgProvider || fileProvider,
      baseConfig.provider,
    ),
    apiKey: cfgApiKey || fileApiKey || baseConfig.apiKey,
    baseUrl: cfgBaseUrl || fileBaseUrl || baseConfig.baseUrl,
    model: cfgModel || fileModel || baseConfig.model,
  };

  return merged;
}

/**
 * Ensure there is an active text editor or show an error.
 * 确保当前有激活的编辑器，否则提示错误。
 */
function getActiveEditorOrShowError(): vscode.TextEditor | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    void vscode.window.showErrorMessage("No active editor. 请先打开一个文件。");
    return undefined;
  }
  return editor;
}

/**
 * Open a new untitled Markdown document with the generated prompt.
 * 使用生成的 Prompt 打开一个新的 Markdown 文档。
 */
async function openPromptInMarkdownDocument(prompt: string): Promise<void> {
  const doc = await vscode.workspace.openTextDocument({
    language: "markdown",
    content: prompt,
  });
  await vscode.window.showTextDocument(doc, { preview: false });
}

/**
 * Handle "PromptOS: Generate Prompt from DSL".
 * 处理 “PromptOS: Generate Prompt from DSL” 命令。
 */
export async function handleGeneratePromptFromDsl(
  _context: vscode.ExtensionContext,
): Promise<void> {
  const editor = getActiveEditorOrShowError();
  if (!editor) return;

  // 1. Ability Picker Step
  // 创建 QuickPick 让用户搜索能力
  const items = builtinAbilities.map((a) => ({
    label: `$(symbol-function) ${a.id}`, // 添加图标更像 IDE 原生体验
    description: a.description,
    detail: `Arg: ${a.argsHint}`,
    abilityId: a.id, // 自定义属性用于传递 ID
    argsHint: a.argsHint,
  }));

  const selectedItem = await vscode.window.showQuickPick(items, {
    title: "PromptOS: Select Ability",
    placeHolder: "Search for an ability (e.g. code.review)...",
    matchOnDescription: true,
    ignoreFocusOut: true,
  });

  if (!selectedItem) {
    return; // User canceled
  }

  // 2. Argument Input Step (Optional)
  // 选中能力后，询问参数。
  // 未来可以在 AbilityMeta 中定义是否需要参数，目前 MVP 全部询问。
  const args = await vscode.window.showInputBox({
    title: `Arguments for ${selectedItem.abilityId}`,
    prompt: `Enter arguments for ${selectedItem.abilityId}`,
    placeHolder: selectedItem.argsHint || "Optional arguments...",
    value: "", // 默认为空
    ignoreFocusOut: true,
  });

  if (args === undefined) {
    return; // User canceled (Esc)
  }

  // 3. Construct DSL String
  // 按照新的 "Flexible Dot-Notation" 拼装： id(args)
  // 示例: code.review(strict) 或 code.review()
  const dslString = args.trim()
    ? `${selectedItem.abilityId}(${args.trim()})`
    : `${selectedItem.abilityId}`;

  // 4. Execution
  const selection = editor.selection;
  const selectedText = selection.isEmpty
    ? ""
    : editor.document.getText(selection);

  const languageId = editor.document.languageId;
  const codeLanguage = mapLanguageId(languageId);

  const userProfile = resolveUserProfile();
  const taskNote = await buildTaskNoteForVSCode({
    codeLanguage,
    selectedText,
    additionalNote: undefined,
  });

  // 使用拼装好的 DSL 调用 SDK
  const sdkArgs: GeneratePromptArgs = {
    dsl: dslString,
    selectedText,
    userProfile,
    taskNote,
  };

  try {
    const result = await generatePrompt(sdkArgs);
    await openPromptInMarkdownDocument(result.prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    void vscode.window.showErrorMessage(
      `PromptOS Generation Failed: ${message}`,
    );
  }
}

/**
 * Handle "PromptOS: Run DSL from Current Line".
 * 处理 “Run DSL from Current Line” 命令。
 * * 只需要微调以适应新语法宽容度（目前保持原样即可，SDK 层的解析器会处理新语法）。
 */
export async function handleRunDslFromCurrentLine(
  _context: vscode.ExtensionContext,
): Promise<void> {
  const editor = getActiveEditorOrShowError();
  if (!editor) return;

  const document = editor.document;
  const cursorLine = editor.selection.active.line;
  const lineText = document.lineAt(cursorLine).text;
  const trimmed = lineText.trim();

  // 保持 op: 前缀检查，作为触发标识
  if (!trimmed.startsWith("op:")) {
    void vscode.window.showErrorMessage(
      "Current line is not a PromptOS command (missing 'op:' prefix).",
    );
    return;
  }

  // 提取 DSL 部分
  const dsl = trimmed.slice("op:".length).trim();
  if (!dsl) {
    void vscode.window.showErrorMessage("PromptOS command is empty.");
    return;
  }

  // ... (其余逻辑与之前相同：获取上下文、调用 SDK) ...
  // 注意：generatePrompt 内部的 DSL Parser 必须已经升级支持新语法，
  // 否则这里传进去的 "code.review(strict)" 可能会在 SDK 内部解析失败。

  const selection = editor.selection;
  const selectedText = selection.isEmpty ? "" : document.getText(selection);
  const languageId = document.languageId;
  const codeLanguage = mapLanguageId(languageId);
  const userProfile = resolveUserProfile();
  const taskNote = await buildTaskNoteForVSCode({
    codeLanguage,
    selectedText,
    additionalNote: undefined,
  });

  const args: GeneratePromptArgs = {
    dsl,
    selectedText,
    userProfile,
    taskNote,
  };

  try {
    const result = await generatePrompt(args);
    await openPromptInMarkdownDocument(result.prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    void vscode.window.showErrorMessage(
      `PromptOS Execution Failed: ${message}`,
    );
  }
}
