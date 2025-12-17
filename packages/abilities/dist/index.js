"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builtinAbilities = void 0;
exports.loadAbilityById = loadAbilityById;
const builtinAbilities_1 = require("./builtinAbilities");
Object.defineProperty(exports, "builtinAbilities", { enumerable: true, get: function () { return builtinAbilities_1.builtinAbilities; } });
/**
 * Load an ability by its abilityId (e.g. "code.review.api").
 * 通过 abilityId 加载能力元数据（例如 "code.review.api"）。
 *
 * For now, this only searches the in-memory builtin list.
 * 当前仅在内置列表中查找，未来可扩展为 Supabase / RAG 等远程能力。
 */
async function loadAbilityById(abilityId) {
    const ability = builtinAbilities_1.builtinAbilities.find((a) => a.id === abilityId) ?? null;
    // TODO: v0.1.2+:
    // - Merge with user-defined abilities stored in Supabase / pgvector.
    // - Apply RAG-based recommendation / fallback.
    // - Potentially expose as MCP tools.
    // 将来在此合并 Supabase / RAG 的用户自定义能力，并通过 MCP 暴露。
    return ability;
}
//# sourceMappingURL=index.js.map