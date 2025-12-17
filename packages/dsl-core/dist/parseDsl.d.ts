import { ParsedDSL } from "./types";
/**
 * Parse a PromptOS DSL string into structured components.
 * 将 PromptOS DSL 字符串解析为结构化结果。
 *
 * @throws {DslParseError} when the input does not conform to DSL v0.1.
 */
export declare function parseDsl(input: string): ParsedDSL;
