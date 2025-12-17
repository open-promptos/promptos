"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// apps/host-vscode/src/extension.ts
const vscode = __importStar(require("vscode"));
const promptosService_1 = require("./promptosService");
/**
 * Extension entry point.
 * VSCode 扩展入口。
 */
function activate(context) {
    // Register "Generate Prompt from DSL" command
    // 注册 “Generate Prompt from DSL” 命令
    const generatePromptCmd = vscode.commands.registerCommand("promptos.generatePromptFromDsl", async () => {
        try {
            await (0, promptosService_1.handleGeneratePromptFromDsl)(context);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            void vscode.window.showErrorMessage(`PromptOS generatePromptFromDsl failed: ${message}`);
        }
    });
    // Register "Run DSL from Current Line" command
    // 注册 “Run DSL from Current Line” 命令
    const runDslFromLineCmd = vscode.commands.registerCommand("promptos.runDslFromCurrentLine", async () => {
        try {
            await (0, promptosService_1.handleRunDslFromCurrentLine)(context);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            void vscode.window.showErrorMessage(`PromptOS runDslFromCurrentLine failed: ${message}`);
        }
    });
    context.subscriptions.push(generatePromptCmd, runDslFromLineCmd);
}
/**
 * Called when the extension is deactivated.
 * 扩展被禁用时调用（此处无需清理资源）。
 */
function deactivate() {
    // no-op
}
//# sourceMappingURL=extension.js.map