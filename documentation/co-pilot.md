# GitHub Copilot Documentation Guidelines

## Canonical Source
The canonical Copilot instruction source is `.github/copilot-instructions.md`.
This file mirrors documentation-specific guidance for discoverability in `documentation/`.

## Purpose
This file defines how documentation must be written and maintained in this repository.

## Scope
These rules apply to all Markdown files in `documentation/` and any documentation sections in `README.md`.

## Writing Principles
- Write for maintainability first: each file should have a single clear topic.
- Prefer small, focused updates instead of large rewrites.
- Keep examples realistic and aligned with the current codebase.
- Prefer explicit instructions over ambiguous statements.
- If behavior changes, update docs in the same change whenever possible.
- Prioritize beginner readability: explain what/why before how.

## Tone and Style
- Use clear, direct, instructional language.
- Use present tense and active voice.
- Avoid marketing language, slang, or filler text.
- Keep paragraphs short; use lists for procedures and requirements.
- Define acronyms the first time they are used.
- Minimize jargon; when unavoidable, add a brief plain-language explanation.

## Formatting and Structure Rules
- Use one H1 (`#`) per file and logical heading levels (`##`, `###`).
- Start each file with a short purpose statement.
- Use consistent section ordering across files where applicable.
- Use fenced code blocks with language identifiers (`bash`, `ts`, `json`, etc.).
- Keep command snippets copy-paste ready.
- Use relative links for internal documentation links.
- For tutorial-like sections, include: prerequisites, steps, and expected result.

## Consistency Rules
- Terminology must stay consistent across all docs (API names, route paths, model names).
- Route references must match implementation (method + path).
- Environment variable names must match actual names in code.
- Avoid duplicate canonical information in multiple files; link to the source file instead.

## Required Documentation Sections
Every mature project documentation set should cover these topics (as separate files where practical):
1. Overview / project context
2. Setup and prerequisites
3. Configuration and environment variables
4. Architecture and folder structure
5. API reference and endpoint behavior
6. Data model and persistence (Prisma + DB)
7. Operational workflows (run, test, migrate, troubleshoot)
8. Contributing workflow and coding conventions
9. Security and secrets handling
10. Changelog or release notes policy (optional but recommended)

## File Naming Rules
- Use lowercase kebab-case filenames.
- Use topic-oriented names (for example: `setup.md`, `architecture.md`, `api.md`).
- Avoid ambiguous names like `notes.md` or `misc.md`.
- Keep filenames stable; rename only when scope changes significantly.

## README Linking Rules
- Add a dedicated **Documentation** section in `README.md` near the top (after project description).
- Keep links in a stable, intentional order (from onboarding to advanced topics).
- Link text should describe the destination clearly.
- When adding a new file in `documentation/`, add its link to `README.md` in the correct order in the same pull request.
- If a file is deprecated, remove or replace its README link immediately.

## Update Workflow for New Docs
When creating a new documentation file:
1. Choose a filename using the naming rules above.
2. Add a purpose statement at the top.
3. Follow the required structure and formatting standards.
4. Add/update cross-links to related docs.
5. Add the file link in `README.md` Documentation section.
6. Verify all links resolve and examples are still valid.
