/**
 * Metadata definition for a PromptOS Ability.
 * PromptOS 能力元数据的核心定义。
 */
export interface AbilityMeta {
    /**
     * Unique identifier for the ability.
     * New Architecture: The primary key (e.g. "code.review.api").
     */
    id: string;
    /**
     * Human-readable description.
     */
    description: string;
    /**
     * Hint for arguments passed in parentheses.
     * e.g. "style? (strict, concise)"
     */
    argsHint?: string;
    /**
     * Prompt generation strategy.
     */
    strategy: "static" | "llm";
    /**
     * Raw template for static strategy.
     */
    staticPromptTemplate?: string;
    /**
     * Example usages for documentation/discovery.
     */
    examples?: {
        dsl: string;
        description?: string;
    }[];
    /**
     * Additional hints for the prompt generation.
     */
    promptHints?: string[];
    /**
     * Supported programming languages (lowercase).
     */
    supportedLanguages?: string[];
    /**
     * Specific hints per language.
     */
    languageSpecificHints?: Record<string, string>;
    domain?: string;
    subdomain?: string;
    action?: string;
}
