# 确保依赖安装

npm install

# 构建 VSCode 插件

npm run build -- --filter promptos-vscode

# 如果你包名不同（取决于 apps/host-vscode/package.json 的 "name"），改为对应名字

创建了 VSCode 扩展 apps/host-vscode；

✅ 在 package.json 中声明了：

main: "./dist/extension.js"

两个命令：promptos.generatePromptFromDsl / promptos.runDslFromCurrentLine

两个快捷键：Ctrl+Alt+P / Ctrl+Alt+O

配置项：promptos.llm.\* + promptos.useClipboardAsFallbackContext

✅ extension.ts 只负责命令注册与错误提示；

✅ promptosService.ts 负责：

解析当前行是否有 op: 前缀，并提取 DSL；

获取选中内容 / 剪贴板 / languageId；

映射 languageId → codeLanguage；

构造结构化 taskNote（含 [Code Language] / [Selected Text] / [Clipboard] / [Additional Note]）；

调用 @promptos/sdk.generatePrompt；

新建 Markdown 文档展示 Prompt；

预留 resolveLLMConfigForVSCode() 用于未来 LLM 策略
