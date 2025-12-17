import { ParsedDSL } from "./types";
/**
 * Parse the PromptOS DSL string into a structured object.
 * Supports the new Flexible Dot-Notation: "ability.id(args)"
 */
export declare function parseDsl(input: string): ParsedDSL;
