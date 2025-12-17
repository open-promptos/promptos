import * as vscode from "vscode";
import type { LLMConfig } from "@promptos/llm-core";
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
export declare function resolveLLMConfigForVSCode(): LLMConfig;
/**
 * Handle "PromptOS: Generate Prompt from DSL".
 * 处理 “PromptOS: Generate Prompt from DSL” 命令。
 */
export declare function handleGeneratePromptFromDsl(_context: vscode.ExtensionContext): Promise<void>;
/**
 * Handle "PromptOS: Run DSL from Current Line".
 * 处理 “Run DSL from Current Line” 命令。
 * * 只需要微调以适应新语法宽容度（目前保持原样即可，SDK 层的解析器会处理新语法）。
 */
export declare function handleRunDslFromCurrentLine(_context: vscode.ExtensionContext): Promise<void>;
