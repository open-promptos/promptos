export interface ParsedDSL {
    /**
     * The full original DSL string (e.g. "op:code.review(strict)")
     */
    raw: string;
    /**
     * The unique identifier for the ability (e.g. "code.review")
     * Extracted from the part before the arguments.
     */
    abilityId: string;
    /**
     * Optional arguments passed in parentheses (e.g. "strict")
     * If no parentheses, this is undefined.
     */
    args?: string;
    /**
     * @deprecated
     * 保留这些字段是为了兼容旧代码，但它们现在只是 abilityId 的拆解或别名
     */
    domain?: string;
    subdomain?: string;
    action?: string;
}
