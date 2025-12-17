// packages/prompt-writer/src/types.ts
import type { ParsedDSL } from "@promptos/dsl-core";

/**
 * Metadata for a PromptOS ability.
 * Updated for the "Flat Registry" architecture.
 */
export interface AbilityMeta {
  /** Unique ability id, e.g. "code.review.api". */
  id: string;

  /** Human-readable description. */
  description: string;

  // [Refactor] The segmentation fields are removed/optional now.
  domain?: string;
  subdomain?: string;
  action?: string;

  /** Examples for this ability. */
  examples?: {
    dsl: string;
    description?: string;
  }[];

  promptHints?: string[];

  strategy?: "static" | "llm";
  staticPromptTemplate?: string;

  supportedLanguages?: string[];
  languageSpecificHints?: Record<string, string>;
}

/**
 * Minimal user profile passed into the prompt writer.
 */
export interface UserProfile {
  id: string;
  displayName?: string;
  locale?: string;
  timezone?: string;
  role?: string;
  preferences?: Record<string, unknown>;
}

/**
 * Input structure for LLMPromptWriter.
 */
export interface PromptWriterInput {
  ability: AbilityMeta;
  parsedDsl: ParsedDSL;
  userProfile: UserProfile;
  /**
   * Structured task note from SDK.
   */
  taskNote?: string;
}

/**
 * System prompt template definition.
 */
export interface PromptWriterSystemTemplate {
  id: string;
  name: string;
  description?: string;
  abilityId?: string;
  systemPrompt: string;
}
