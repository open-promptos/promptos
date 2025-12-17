import type { AbilityMeta } from "@promptos/prompt-writer";
import { builtinAbilities } from "./builtinAbilities";
export { builtinAbilities };
/**
 * Load an ability by its abilityId (e.g. "code.review.api").
 * 通过 abilityId 加载能力元数据（例如 "code.review.api"）。
 *
 * For now, this only searches the in-memory builtin list.
 * 当前仅在内置列表中查找，未来可扩展为 Supabase / RAG 等远程能力。
 */
export declare function loadAbilityById(abilityId: string): Promise<AbilityMeta | null>;
