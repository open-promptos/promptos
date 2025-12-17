# PromptOS Command DSL Specification v0.2

**Version:** v0.2 (Refactored)
**Status:** Active
**Scope:** Flexible Dot-Notation Grammar

## 1. Overview

PromptOS uses a Flexible Dot-Notation DSL.

It is designed to be minimal, allowing users to invoke abilities from a flat registry with optional arguments.

A DSL command is later combined with:

- contextual content (e.g. selected code, clipboard)
- user profile
- ability metadata

to produce a fully-formed prompt.

---

## 2. Syntax Rules

### 2.1 The Shape

The core grammar describes a command as an **Identifier** optionally followed by **Arguments** in parentheses.

Plaintext

`AbilityID(Arguments?)`

### 2.2 Parsing Logic (The "Greedy Match" Rule)

The parser identifies the components using the following logic:

1. **Strip Prefix**: If the string starts with a host-specific prefix (like `op:`), remove it.
2. **Find Separator**: Find the **last occurrence** of `(`.
3. **Extract ID**: Everything **before** that `(` is the `AbilityID`.
4. **Extract Args**: Everything **inside** that `(` ... `)` is the `Arguments`.
5. **Fallback**: If no `(` exists, the entire string is the `AbilityID`, and `Arguments` is `undefined`.

### 2.3 Examples

| **Raw Input**                      | **Parsed AbilityID**         | **Parsed Arguments** | **Notes**                                  |
| ---------------------------------- | ---------------------------- | -------------------- | ------------------------------------------ |
| `code.explain`                     | `code.explain`               | `undefined`          | No arguments provided.                     |
| `code.review(strict)`              | `code.review`                | `strict`             | Standard usage.                            |
| `translate(zh-CN)`                 | `translate`                  | `zh-CN`              | ID does not need dots.                     |
| `agent.run(debug, v2)`             | `agent.run`                  | `debug, v2`          | Arguments are preserved as a raw string.   |
| `weird.id.with(parentheses)(args)` | `weird.id.with(parentheses)` | `args`               | Greedy match handles ID containing parens. |

---

## 3. Host-Specific Prefix: `op:`

In text-based hosts (like VSCode, CLI, or comments), lines must start with `op:` to be recognized as DSL.

- **Valid DSL**: `op:code.review(strict)`
- **Ignored Text**: `code.review(strict)`

**Behavior:**

- The prefix is **not** part of the core DSL grammar.
- It is stripped (case-insensitive) before the parser runs.
- `OP:`, `Op:` are also valid.

---

## 4. Parsed Structure

A compliant parser must produce a structure equivalent to:

TypeScript

`export interface ParsedDSL {
/\*\* _ The full original DSL string (minus the host prefix).
_/
raw: string;

/\*\* \* The unique identifier for the ability.

- Extracted from the part before the arguments.
  \*/
  abilityId: string;

/\*\*

- Optional arguments passed in parentheses.
- If no parentheses were present, this is undefined.
  \*/
  args?: string;

/\*\*

- @deprecated
- Legacy fields (domain, subdomain, action) are computed aliases
- or removed entirely in v0.1.2+.
  \*/
  domain?: string;
  subdomain?: string;
  action?: string;
  }`

---

## 5. Formal Grammar (EBNF)

EBNF

`Command ::= HostPrefix? AbilityID Arguments?
HostPrefix ::= "op:" | "OP:"

Arguments ::= "(" ArgsContent ")"
ArgsContent ::= /_ Any character string _/

AbilityID ::= /_ Any character string excluding the final Arguments block _/`

---

## 6. Error Handling

A robust parser should:

1. **Trim Whitespace**: `code.explain ( strict )` should parse as ID=`code.explain`, Args=`strict`.
2. **Handle Empty Args**: `code.explain()` -> ID=`code.explain`, Args=`` (empty string).
3. **Reject Empty Strings**: An empty string (or just `op:`) should throw an error or return null.

---

## 7. Design Principles

- **Flat & Flexible**: We do not enforce a fixed 3-level hierarchy (`domain.subdomain.action`). Users can define IDs as simple as `summarize` or as deep as `company.team.backend.api.review`.
- **Arguments as String**: The DSL treats arguments as a raw string. It is up to the specific **Ability** or **Prompt Writer** to parse that string (e.g., split by comma).
- **Context-Light**: The DSL carries intent (`abilityId`) and directives (`args`). Heavy content (code selection, file contents) is injected by the Host environment, not typed in the DSL.

---

End of v0.2 DSL Specification.
