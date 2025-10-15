\# AGENTS.md Best practices



* Keep it short

Aim for ≤ 150 lines. Long files slow the agent and bury signal.



* Use concrete commands

Wrap commands in back-ticks so agents can copy-paste without guessing.



* Update alongside code

Treat AGENTS.md like code—PR reviewers should nudge updates when build steps change.


this project using this 
https://github.com/ifindev/fullstack-next-cloudflare

always using exa mcp for latest stackbase and shadcn mcp for compatible blocks components


* One source of truth

Avoid duplicate docs; link to READMEs or design docs instead of pasting them.



* Make requests precise

The more precise your guidance for the task at hand, the more likely the agent is to accomplish that task to your liking.



* Verify before merging

Require objective proof: tests, lint, type check, and a diff confined to agreed paths.






\## Code Quality and Linting



\### IDE Diagnostics - REQUIRED FIRST STEP

\- \*MUST check IDE diagnostics BEFORE running the linter\*

\- Use getIdeDiagnostics tool to check for TypeScript errors and warnings

\- Resolve ALL diagnostic problems (type errors, unused imports, etc.) first

\- Only after fixing IDE diagnostics should you proceed to run the linter

\- This prevents linting cosmetic issues while type errors remain unfixed



\### Biome Linter - MANDATORY

\- \*MUST run Biome linter after creating or editing any file\*

\- Run linter command: bun run check (from project root)

\- Or for specific files: bunx biome check --write <file-path>

\- The linter will:

&nbsp; - Format code according to project style

&nbsp; - Fix auto-fixable issues

&nbsp; - Report remaining issues that need manual fixes

\- \*Do NOT skip linting\* - it ensures code consistency across the project

\- If linter reports errors, fix them before considering the task complete

