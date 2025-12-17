# PromptOS Backend Design

**Version:** v0.1.2 (Refactored)
**Status:** Draft
**Scope:** Cloud sync for profiles & abilities, pgvector-based RAG, MCP integration design.

## 1. Goals & Non-Goals

### 1.1 Goals

The backend exists to support PromptOS as:

- A **shared ability catalog** across devices and team members.
- A **semantic layer** for:
  - command completion (partial DSL / natural language → abilities)
  - ability recommendation (natural language → `abilityId`s)
- A **host for MCP tools** that expose abilities in a standard way.

Concretely, the backend should:

1. Store **user profiles** (preferences, identity, language, etc.).
2. Store **user-defined abilities** (Flat Registry model).
3. Store **vector embeddings** for abilities to enable RAG flows.
4. Provide APIs (REST/RPC) for querying abilities and profiles.
5. Expose abilities as **MCP tools**, mapping cleanly to PromptOS DSL.

### 1.2 Non-Goals (for v0.1.x)

The backend does **not** aim to:

- Execute LLM calls on behalf of clients (clients call providers directly).
- Orchestrate multi-step agents or tools.
- Store **all** prompts or user conversations (only ability metadata & embeddings).
- Replace local built-in abilities – it only **extends** them.

---

## 2. High-Level Architecture

At v0.1.2, the backend is designed as:

- **Supabase** (PostgreSQL + auth + storage)
- **pgvector** extension enabled for vector similarity
- A thin API layer (Supabase Edge Functions or Auto-generated APIs)
- An **MCP adapter** exposing abilities as tools

PromptOS clients:

- Continue to run **LLM calls locally** (e.g. from VSCode, CLI).
- Use the backend only to:
  - sync user profile and abilities
  - discover / recommend abilities via RAG
  - enumerate abilities via MCP.

---

## 3. Data Model

### 3.1 `profiles` Table

Stores basic user persona and preferences.

SQL

`create table public.profiles (
id uuid primary key default gen_random_uuid(),

-- Foreign key to Supabase auth users.id
user_id uuid unique references auth.users (id) on delete cascade,

username text unique not null,
display_name text,
avatar_url text,

bio text,
-- Arbitrary JSON preferences, e.g. default language, tone, preferred LLM, etc.
preferences jsonb default '{}'::jsonb,

created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
);

create index profiles_user_id_idx on public.profiles (user_id);`

**Basic semantics:**

- `preferences` can store:
  - default output language
  - preferred `strategy` (static vs llm)
  - code style preferences, etc.
- PromptOS SDK/hosts may fetch profile data to shape prompts (e.g. default tone).

---

### 3.2 `abilities` Table

Stores **user-defined abilities** and their vector embeddings.
Aligned with the **Flat Registry** architecture.

SQL

`create table public.abilities (
id uuid primary key default gen_random_uuid(),

-- Owner of this ability (nullable for global / builtin abilities)
user_id uuid references auth.users (id) on delete cascade,

-- PromptOS Ability ID (Primary Key Logic)
-- e.g. "code.review.api", "translate", "my.custom.agent"
ability_id text not null,

-- Human-friendly title / name
title text not null,
description text,

-- Hint for arguments (e.g. "style? (strict, concise)")
args_hint text,

-- Example DSL strings for this ability
dsl_examples jsonb default '[]'::jsonb,

-- Free-form metadata (tags, categories, etc.)
metadata jsonb default '{}'::jsonb,

-- Full serialized AbilityMeta (optional, for convenience / backup)
-- Contains strategy, staticPromptTemplate, supportedLanguages, etc.
ability_meta jsonb,

-- Vector embedding for semantic search
embedding vector(1536),

is_public boolean not null default false,

created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),

-- Constraint: unique ability_id per user (or global)
unique (user_id, ability_id)
);

create index abilities_user_id_idx on public.abilities (user_id);
create index abilities_ability_id_idx on public.abilities (ability_id);

-- pgvector index
create index abilities_embedding_ivfflat_idx
on public.abilities
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);`

**Key concepts:**

- `ability_id`: The single source of truth. No enforced `domain` or `subdomain` columns.
- `ability_meta`: Stores the full definition compatible with the SDK types.
- `embedding`: Derived from `ability_id`, `title`, `description`, and `dsl_examples`.

---

## 4. RAG Flows

There are two main RAG flows:

1. **Command completion** – user types partial DSL or natural language, system suggests abilities.
2. **Ability recommendation** – user describes what they want; system suggests relevant `abilityId`s.

### 4.1 Embedding Strategy

For each ability, we generate an embedding from a text chunk like:

Plaintext

`Ability ID: code.review.api Title: API Design Code Review Description: Review code for API design flaws, naming, and boundaries. Examples: op:code.review.api(strict), op:code.review.api(concise) Tags: coding, api, review`

### 4.2 Command Completion

**Use case:**

- The user types `op:code.re` or `"translate"` in an input box.

**Query construction options:**

1. **Hybrid search**:
   Combine prefix filters on `ability_id` with vector search.SQL
   `select ability_id, title, description, args_hint, 1 - (embedding <=> query_embedding) as similarity from public.abilities where (user_id = :user_id or is_public = true) and ( ability_id ilike :prefix || '%' or title ilike '%' || :prefix || '%' ) order by embedding <-> query_embedding limit 10;`

**Frontend behavior:**

- Display suggestions like:Plaintext
  `code.review.api – Review API design code.review.impl – Review implementation details write.tech.spec – Write technical design specification`

---

### 4.3 Ability Recommendation

**Use case:**

- User enters: “Review this REST API design thoroughly”

**Flow:**

1. Host generates a query embedding from input.
2. Run vector similarity search against `abilities`.SQL

   `select ability_id, title, description, 1 - (embedding <=> query_embedding) as similarity from public.abilities where user_id = :user_id or is_public = true order by embedding <-> query_embedding limit 5;`

3. Output a list of candidate abilities.

---

## 5. Merging Local & Remote Abilities

### 5.1 Merge Strategy

When listing or searching abilities, the client should:

1. Load **local built-in abilities** (from `packages/abilities`).
2. Fetch **remote abilities** for current user from Supabase.
3. Deduplicate by `abilityId`:
   - **Local wins** by default for stability.
   - Remote can override if configured.

TypeScript

`type AbilitySource = "builtin" | "remote" | "merged";

interface ResolvedAbility {
abilityId: string;
meta: AbilityMeta;
source: AbilitySource;
}`

---

## 6. MCP Integration Design

PromptOS abilities are exposed as **MCP tools**, allowing any MCP client (like Claude Desktop or generic agents) to use your prompt library.

### 6.1 Mapping DSL ↔ MCP Tools

- **MCP Tool Name** = `ability_id` (e.g., `code.review.api`)
- **MCP Tool Description** = `ability.description` + `args_hint`

### 6.2 MCP Tool Shape (Conceptual)

JSON

`{ "name": "code.review.api", "description": "Perform an API design oriented code review. Args hint: style? (strict, concise)", "input_schema": { "type": "object", "properties": { "dsl_args": { "type": "string", "description": "Optional arguments for the ability, e.g. 'strict' or 'zh-CN'" }, "selectedText": { "type": "string", "description": "Code or text to be processed" }, "taskNote": { "type": "string", "description": "Additional user instructions" } } } }`

**Workflow:**

1. MCP Client calls tool `code.review.api` with `{ dsl_args: "strict", selectedText: "..." }`.
2. PromptOS Backend (acting as MCP Server) calls:
   `generatePrompt({ dsl: "code.review.api(strict)", ... })`.
3. Backend returns the **compiled prompt**.
4. MCP Client uses the prompt with its own LLM.

---

## 7. API Surface (Sketch)

### 7.1 Profiles

`GET /api/profiles/me PATCH /api/profiles/me`

### 7.2 Abilities

`GET /api/abilities # list abilities
POST /api/abilities # create ability
GET /api/abilities/:id # get by db id
PATCH /api/abilities/:id # update
DELETE /api/abilities/:id # delete

POST /api/abilities/search # vector / hybrid search
POST /api/abilities/recommend # natural-language recommendation`

---

## 8. Security & Multi-Tenancy

- **Row Level Security (RLS)** is critical.
- Policies:
  - `select`: `auth.uid() = user_id` OR `is_public = true`
  - `insert/update/delete`: `auth.uid() = user_id`

---

End of `docs/backend.md` (v0.1.2 Refactored).
