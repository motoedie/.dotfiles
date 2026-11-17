# SQL health

Report-only review of SQL affected by a change. It checks value and identifier
construction, PostgreSQL schema and indexes, `EXPLAIN` plans, query performance,
index fit, and changed migrations that affect the reviewed SQL.

## Quick start

| Command | Review |
| --- | --- |
| `sql-health` | Local branch against its merge baseline, including working-tree changes |
| `sql-health uncommitted` | Staged, unstaged, and non-ignored untracked changes |
| `sql-health staged` | Staged changes only |

## Choose the scope

| Argument | Scope |
| --- | --- |
| `base <ref>` | Current branch compared with another base ref |
| `<revision>` or `<revision range>` | Explicit committed changes |
| `<change scope> <paths>` | Change scope filtered to files or directories |
| `<paths>` | Explicit audit of current SQL in those paths |
| `source=<id>` | DBHub source to use, when your config has more than one |

Every affected query is reviewed against relevant schema and existing indexes.
When the DBHub MCP server is connected, the skill reads raw schema and index
definitions from the PostgreSQL catalog and raw `EXPLAIN (FORMAT JSON)` plans,
without running the queries. Without
DBHub, the static review still runs.

The skill reports critical-, high-, and medium-impact findings after independent
verification; findings the verifier cannot decide stay in a report marked
incomplete.
It does not edit code or schema, run migrations, execute application SQL, or
review transaction behavior, locking, general tuning, and unrelated migration
safety.

## Connect the database

The skill talks to PostgreSQL only through [DBHub](https://github.com/bytebase/dbhub),
an MCP server. You write the connection details into one config file, one
time. The skill never asks for them, and never reads environment variables or
`.env` files.

The steps are the same on Linux, macOS, and Windows.

### 1. Install Node.js

DBHub runs with `npx`, which comes with [Node.js](https://nodejs.org/). Check:

```bash
npx --version
```

### 2. Create the config file

Copy [`dbhub.toml.example`](dbhub.toml.example) to
`~/.config/dbhub/dbhub.toml` (on Windows:
`C:\Users\<you>\.config\dbhub\dbhub.toml`).

Linux and macOS:

```bash
mkdir -p ~/.config/dbhub
cp dbhub.toml.example ~/.config/dbhub/dbhub.toml
chmod 600 ~/.config/dbhub/dbhub.toml
```

Open the file and fill in `host`, `database`, `user`, and `password`. Change
`port` if your database does not use `5432`.

Keep the file out of every Git repository. It holds your password.

Tip: give the skill its own database user. A user with read access is enough
for reviews.

### 3. Add DBHub to Claude Code

```bash
claude mcp add --scope user dbhub -- npx -y @bytebase/dbhub@1.6.1 --config ~/.config/dbhub/dbhub.toml
```

Keep the version pinned. Use `1.6.1` or newer; versions before `0.22.6` have a
read-only bypass.

### 4. Restart and check

Restart Claude Code, then run:

```bash
claude mcp list
```

`dbhub` must show as connected. If it does not, check the values in the config
file first.

### More than one database

Add one `[[sources]]` block per database, each with its own `id`, and repeat
the two `[[tools]]` blocks with `source = "<id>"`. Then pick the database
with `source=<id>`, for example `sql-health staged source=staging`.
