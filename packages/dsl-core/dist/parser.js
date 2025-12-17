"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDsl = parseDsl;
/**
 * Parse the PromptOS DSL string into a structured object.
 * Supports the new Flexible Dot-Notation: "ability.id(args)"
 */
function parseDsl(input) {
    // 1. 预处理：移除 "op:" 前缀（如果存在），并清理空白
    const raw = input.trim();
    const cleanInput = raw.replace(/^op:\s*/i, "").trim();
    if (!cleanInput) {
        throw new Error("DSL input is empty");
    }
    // 2. 正则解析
    // 逻辑：
    // ^([^(]+)       -> Group 1: ID (匹配开头所有非左括号的字符)
    // (?:\((.*)\))?$ -> Group 2 (Optional): 括号内的参数
    //                   \((.*)\) 贪婪匹配内部所有内容，这意味着 magic(a(b)) 会把 a(b) 当作参数
    const match = cleanInput.match(/^([^(]+)(?:\((.*)\))?$/);
    if (!match) {
        // 理论上上面的正则能匹配几乎所有非空字符串，但作为兜底：
        return {
            raw,
            abilityId: cleanInput,
            args: undefined,
        };
    }
    const abilityId = match[1].trim();
    const args = match[2] ? match[2].trim() : undefined;
    // 3. 兼容旧字段 (Legacy Support)
    // 尝试把 abilityId (e.g. "code.review.api") 拆解，防止旧的 SDK 逻辑报错
    const parts = abilityId.split(".");
    const domain = parts[0];
    const action = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    // subdomain 比较模糊，取中间部分或为空
    const subdomain = parts.length > 2 ? parts.slice(1, -1).join(".") : undefined;
    return {
        raw,
        abilityId,
        args,
        // Legacy mapping
        domain,
        subdomain,
        action,
    };
}
//# sourceMappingURL=parser.js.map