import { LLMConfig } from "./types";
/**
 * Resolve the final configuration by merging sources.
 * Priority: Env > Dotfile > Defaults
 * * 解析最终配置。优先级：环境变量 > 配置文件 > 默认值。
 */
export declare function loadConfig(override?: Partial<LLMConfig>): LLMConfig;
/**
 * @deprecated Use loadConfig() instead.
 * 保持兼容性，但建议使用新的 loadConfig。
 */
export declare function configFromEnv(): LLMConfig;
