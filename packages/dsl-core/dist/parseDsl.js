"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDsl = parseDsl;
// packages/dsl-core/src/parseDsl.ts
const types_1 = require("./types");
// Identifier: starts with letter or underscore, then letters/digits/underscore
// 标识符：字母或下划线开头，后续为字母/数字/下划线
const IDENT = "[A-Za-z_][A-Za-z0-9_]*";
/**
 * Regular expression for DSL v0.1:
 * {context}?domain(arg).subdomain.action(style)?
 *
 * 说明：
 * - 可选 context 必须位于字符串开头，用一对 `{}` 包裹；
 * - arg 一定存在 `()`，但内容可以为空；
 * - style 为可选的一对 `()`。
 */
// eslint-disable-next-line no-useless-escape
const DSL_REGEX = new RegExp([
    "^\\s*", // optional leading whitespace | 前导空白
    "(?:\\{(?<context>[^}]*)\\})?", // optional {context}
    "(?<domain>",
    IDENT,
    ")", // domain
    "\\(",
    "(?<arg>[^)]*)",
    "\\)", // (arg)
    "\\.",
    "(?<subdomain>",
    IDENT,
    ")", // .subdomain
    "\\.",
    "(?<action>",
    IDENT,
    ")", // .action
    "(?:",
    "\\(",
    "(?<style>[^)]*)",
    "\\)",
    ")?", // optional (style)
    "\\s*$", // optional trailing whitespace | 末尾空白
].join(""));
/**
 * Parse a PromptOS DSL string into structured components.
 * 将 PromptOS DSL 字符串解析为结构化结果。
 *
 * @throws {DslParseError} when the input does not conform to DSL v0.1.
 */
function parseDsl(input) {
    const raw = input;
    const trimmed = input.trim();
    if (!trimmed) {
        throw new types_1.DslParseError("Empty DSL string", raw);
    }
    const match = trimmed.match(DSL_REGEX);
    if (!match || !match.groups) {
        throw new types_1.DslParseError("Invalid PromptOS DSL syntax. Expected `{context}?domain(arg).subdomain.action(style)?`.", raw);
    }
    // Strongly type the capture groups so that required fields are strings.
    // 将捕获组强类型为必填/可选字段，确保 domain/subdomain/action 为 string。
    const groups = match.groups;
    const { context, domain, arg, subdomain, action, style } = groups;
    // Normalize empty arg/style/context to undefined
    // 将空字符串归一为 undefined，避免出现空字符串噪音
    const normalizedArg = arg && arg.trim() !== "" ? arg.trim() : undefined;
    const normalizedStyle = style && style.trim() !== "" ? style.trim() : undefined;
    const normalizedContext = context && context.trim() !== "" ? context.trim() : undefined;
    const abilityId = `${domain}.${subdomain}.${action}`;
    return {
        raw,
        context: normalizedContext,
        domain,
        arg: normalizedArg,
        subdomain,
        action,
        style: normalizedStyle,
        abilityId,
    };
}
//# sourceMappingURL=parseDsl.js.map